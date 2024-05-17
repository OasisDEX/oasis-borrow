import { NetworkIds } from 'blockchain/networks'
import request, { gql } from 'graphql-request'
import { configCacheTime, getRemoteConfigWithCache } from 'helpers/config'

const automationQuery = gql`
  query automationTriggers($proxyAddresses: [String]) {
    triggers(where: { account_in: $proxyAddresses, removedBlock: null }) {
      id
      account
      commandAddress
      triggerData
      triggerType
      owner
      executedBlock
      decodedData
      decodedDataNames
    }
  }
`

type AutomationQueryResponse = {
  triggers: {
    id: string
    account: string
    commandAddress: string
    triggerData: string
    triggerType: string
    executedBlock: string
    owner: string
    decodedData: string[]
    decodedDataNames: string[]
  }[]
}

type DecodedDataTypes =
  | 'positionAddress'
  | 'triggerType'
  | 'maxCoverage'
  | 'debtToken'
  | 'collateralToken'
  | 'operationName'
  | 'poolId'
  | 'quoteDecimals'
  | 'collateralDecimals'
  | 'executionLtv'
  | 'closeToCollateral'

type AutomationSupportedNetworks =
  | NetworkIds.MAINNET
  | NetworkIds.ARBITRUMMAINNET
  | NetworkIds.OPTIMISMMAINNET
  | NetworkIds.BASEMAINNET
export type AutomationResponse = {
  networkId: AutomationSupportedNetworks
  triggers: {
    id: string
    account: string
    commandAddress: string
    triggerData: string
    triggerType: string
    executedBlock: string
    owner: string
    decodedData: string[]
    decodedDataNames: string[]
    decodedAndMappedData: Partial<Record<DecodedDataTypes, string>>
  }
}[]

const subgraphListDict = {
  [NetworkIds.MAINNET]: 'summer-automation',
  [NetworkIds.ARBITRUMMAINNET]: 'summer-automation-arbitrum',
  [NetworkIds.OPTIMISMMAINNET]: 'summer-automation-optimism',
  [NetworkIds.BASEMAINNET]: 'summer-automation-base',
} as Record<Partial<NetworkIds>, string>

export const getAutomationData = async ({
  addresses,
  network,
}: {
  addresses: string[]
  network: NetworkIds
}) => {
  if (!subgraphListDict[network]) {
    return []
  }
  const appConfig = await getRemoteConfigWithCache(1000 * configCacheTime.backend)
  const subgraphUrl = `${appConfig.parameters.subgraphs.baseShortUrl}/${subgraphListDict[network]}`
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
          triggers: {
            ...triggerList,
            decodedAndMappedData: triggerList.decodedData.reduce(
              (acc, data, index) => ({
                ...acc,
                [triggerList.decodedDataNames[index]]: data,
              }),
              {},
            ),
          },
        }
      })
      .flat()
  })
  return positionsAutomationList as AutomationResponse
}
