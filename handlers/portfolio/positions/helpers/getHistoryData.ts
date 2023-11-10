import { NetworkIds } from 'blockchain/networks'
import type { OmniProductType } from 'features/omni-kit/types'
import request, { gql } from 'graphql-request'

const historyQuery = gql`
  query historyProxies($proxyAddresses: [String]) {
    proxies(where: { id_in: $proxyAddresses }) {
      position {
        id
        cumulativeDeposit
        cumulativeWithdraw
        cumulativeFees
      }
    }
  }
`

type HistoryQueryResponse = {
  accounts: {
    id: string
    user: {
      id: string
    }
    vaultId: string
    positionType: OmniProductType
    collateralToken: string
    debtToken: string
    protocol: string
    networkId: HistorySupportedNetworks
  }[]
}

export type HistoryResponse = {
  id: string
  user: string
  vaultId: string
  positionType: OmniProductType
  collateralToken: string
  debtToken: string
  protocol: string
  networkId: HistorySupportedNetworks
}[]

export type HistorySupportedNetworks =
  | NetworkIds.MAINNET
  | NetworkIds.ARBITRUMMAINNET
  | NetworkIds.OPTIMISMMAINNET
  | NetworkIds.BASEMAINNET

const subgraphListDict = {
  [NetworkIds.MAINNET]: 'oasis/history',
  [NetworkIds.ARBITRUMMAINNET]: 'oasis/oasis-history-arbitrum',
  [NetworkIds.OPTIMISMMAINNET]: 'oasis-history-optimism',
  [NetworkIds.BASEMAINNET]: 'oasis/oasis-history-base',
} as Record<HistorySupportedNetworks, string>

export const getHistoryData = async ({
  addresses,
  network,
}: {
  addresses: string[]
  network: HistorySupportedNetworks
}) => {
  const subgraphUrl = `${process.env.SUBGRAPHS_BASE_URL}/${subgraphListDict[network]}`
  const params = { proxyAddresses: addresses.map((addr) => addr.toLowerCase()) }
  const historyCall = request<HistoryQueryResponse>(subgraphUrl, historyQuery, params).then(
    (data) => ({
      networkId: network,
      accounts: data.accounts,
    }),
  )
  const proxiesList = await historyCall.then((dpmNetworkList) => {
    return dpmNetworkList
      .map((dpm) => {
        return dpm.accounts.map((account) => {
          return {
            networkId: dpm.networkId,
            id: account.id,
            user: account.user.id,
            vaultId: account.vaultId,
            positionType: account.positionType,
            collateralToken: account.collateralToken,
            debtToken: account.debtToken,
            protocol: account.protocol,
          }
        })
      })
      .flat()
  })
  return proxiesList
}
