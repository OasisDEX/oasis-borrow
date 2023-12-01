import { NetworkIds } from 'blockchain/networks'
import request, { gql } from 'graphql-request'
import type { ConfigResponseType } from 'helpers/config'
import { configCacheTime, getRemoteConfigWithCache } from 'helpers/config'

const automationQuery = gql`
  query automationTriggers($proxyAddresses: [String]) {
    triggers(where: { account_in: $proxyAddresses }) {
      id
      account
      commandAddress
      executedBlock
      removedBlock
      triggerData
      owner
    }
  }
`

type AutomationQueryResponse = {
  triggers: {
    id: string
    account: string
    commandAddress: string
    executedBlock: string
    removedBlock: string
    triggerData: string
    owner: string
  }[]
}

export type AutomationResponse = {
  networkId: AutomationSupportedNetworks // currently just mainnet
  triggers: {
    id: string
    account: string
    commandAddress: string
    executedBlock: string
    removedBlock: string
    triggerData: string
    owner: string
  }
}[]

export type AutomationSupportedNetworks = NetworkIds.MAINNET

const subgraphListDict = {
  [NetworkIds.MAINNET]: 'oasis/automation',
} as Record<AutomationSupportedNetworks, string>

export const getAutomationData = async ({
  addresses,
  network,
}: {
  addresses: string[]
  network: AutomationSupportedNetworks
}) => {
  const appConfig: ConfigResponseType = await getRemoteConfigWithCache(
    1000 * configCacheTime.backend,
  )
  const subgraphUrl = `${appConfig.parameters.subgraphs.baseUrl}/${subgraphListDict[network]}`
  const params = { proxyAddresses: addresses.map((addr) => addr.toLowerCase()) }
  const automationCall = request<AutomationQueryResponse>(
    subgraphUrl,
    automationQuery,
    params,
  ).then((data) => ({
    networkId: network,
    triggers: data.triggers,
  }))
  const positionsAutomationList = await automationCall.then(({ networkId, triggers }) => {
    return triggers
      .map((triggerList) => {
        return {
          networkId,
          triggers: triggerList,
        }
      })
      .flat()
  })
  return positionsAutomationList
}
