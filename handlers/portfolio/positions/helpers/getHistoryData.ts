import { captureException } from '@sentry/nextjs'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import request, { gql } from 'graphql-request'
import type { ConfigResponseType } from 'helpers/config'
import { configCacheTime, getRemoteConfigWithCache } from 'helpers/config'

const historyQuery = gql`
  query historyProxies($proxyAddresses: [String]) {
    proxies(where: { id_in: $proxyAddresses }) {
      position {
        id
        cumulativeDeposit
        cumulativeWithdraw
        cumulativeFees
        cumulativeFeesInQuoteToken
        cumulativeDepositInQuoteToken
        cumulativeWithdrawInQuoteToken
        cumulativeDepositInCollateralToken
        cumulativeWithdrawInCollateralToken
      }
    }
  }
`

type HistoryQueryResponse = {
  proxies: {
    position: {
      id: string
      cumulativeDeposit: string
      cumulativeWithdraw: string
      cumulativeFees: string
      cumulativeFeesInQuoteToken: string
      cumulativeDepositInQuoteToken: string
      cumulativeWithdrawInQuoteToken: string
      cumulativeDepositInCollateralToken: string
      cumulativeWithdrawInCollateralToken: string
    }
  }[]
}

export type HistoryResponse = {
  networkId: HistorySupportedNetworks
  id: string
  cumulativeDeposit: BigNumber
  cumulativeWithdraw: BigNumber
  cumulativeFees: BigNumber
  cumulativeFeesInQuoteToken: BigNumber
  cumulativeDepositInQuoteToken: BigNumber
  cumulativeWithdrawInQuoteToken: BigNumber
  cumulativeDepositInCollateralToken: BigNumber
  cumulativeWithdrawInCollateralToken: BigNumber
}[]

export type HistorySupportedNetworks =
  | NetworkIds.MAINNET
  | NetworkIds.ARBITRUMMAINNET
  | NetworkIds.OPTIMISMMAINNET
  | NetworkIds.BASEMAINNET

const subgraphListDict = {
  [NetworkIds.MAINNET]: 'oasis/oasis-history',
  [NetworkIds.ARBITRUMMAINNET]: 'oasis/oasis-history-arbitrum',
  [NetworkIds.OPTIMISMMAINNET]: 'oasis/oasis-history-optimism',
  [NetworkIds.BASEMAINNET]: 'oasis/oasis-history-base',
} as Record<HistorySupportedNetworks, string>

export const getHistoryData = async ({
  addresses,
  network,
}: {
  addresses: string[]
  network: HistorySupportedNetworks
}) => {
  const appConfig: ConfigResponseType = await getRemoteConfigWithCache(
    1000 * configCacheTime.backend,
  )
  const subgraphUrl = `${appConfig.parameters.subgraphs.baseUrl}/${subgraphListDict[network]}`
  const params = { proxyAddresses: addresses.map((addr) => addr.toLowerCase()) }
  try {
    const historyCall = request<HistoryQueryResponse>(subgraphUrl, historyQuery, params).then(
      (data) => ({
        networkId: network,
        positions: data.proxies,
      }),
    )
    const positionsHistoryList = await historyCall.then(({ networkId, positions }) => {
      return positions
        .map((pos) => {
          return {
            networkId,
            id: pos.position.id,
            cumulativeDeposit: new BigNumber(pos.position.cumulativeDeposit),
            cumulativeWithdraw: new BigNumber(pos.position.cumulativeWithdraw),
            cumulativeFees: new BigNumber(pos.position.cumulativeFees),
            cumulativeFeesInQuoteToken: new BigNumber(pos.position.cumulativeFeesInQuoteToken),
            cumulativeDepositInQuoteToken: new BigNumber(
              pos.position.cumulativeDepositInQuoteToken,
            ),
            cumulativeWithdrawInQuoteToken: new BigNumber(
              pos.position.cumulativeWithdrawInQuoteToken,
            ),
            cumulativeDepositInCollateralToken: new BigNumber(
              pos.position.cumulativeDepositInCollateralToken,
            ),
            cumulativeWithdrawInCollateralToken: new BigNumber(
              pos.position.cumulativeWithdrawInCollateralToken,
            ),
          }
        })
        .flat()
    })
    return positionsHistoryList
  } catch (error) {
    captureException({
      region: 'getHistoryData',
      error,
      addresses,
      network,
    })
    return []
  }
}
