import { captureException } from '@sentry/nextjs'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import request, { gql } from 'graphql-request'
import type { ConfigResponseType } from 'helpers/config'
import { configCacheTime, getRemoteConfigWithCache } from 'helpers/config'

const historyQuery = gql`
  query historyProxies($proxyAddresses: [String]) {
    positions(where: { account_in: $proxyAddresses }) {
      id
      cumulativeDeposit
      cumulativeWithdraw
      cumulativeFees
      cumulativeFeesInQuoteToken
      cumulativeFeesInCollateralToken
      cumulativeDepositInQuoteToken
      cumulativeWithdrawInQuoteToken
      cumulativeDepositInCollateralToken
      cumulativeWithdrawInCollateralToken
    }
  }
`

type HistoryQueryResponse = {
  positions: {
    id: string
    cumulativeDeposit: string
    cumulativeWithdraw: string
    cumulativeFees: string
    cumulativeFeesInQuoteToken: string
    cumulativeFeesInCollateralToken: string
    cumulativeDepositInQuoteToken: string
    cumulativeWithdrawInQuoteToken: string
    cumulativeDepositInCollateralToken: string
    cumulativeWithdrawInCollateralToken: string
  }[]
}

export type HistoryResponse = {
  networkId: HistorySupportedNetworks
  id: string
  cumulativeDeposit: BigNumber
  cumulativeWithdraw: BigNumber
  cumulativeFees: BigNumber
  cumulativeFeesInQuoteToken: BigNumber
  cumulativeFeesInCollateralToken: BigNumber
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
  [NetworkIds.MAINNET]: 'summer-oasis-history',
  [NetworkIds.ARBITRUMMAINNET]: 'summer-oasis-history-arbitrum',
  [NetworkIds.OPTIMISMMAINNET]: 'summer-oasis-history-optimism',
  [NetworkIds.BASEMAINNET]: 'summer-oasis-history-base',
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
  const subgraphUrl = `${appConfig.parameters.subgraphs.baseShortUrl}/${subgraphListDict[network]}`
  const params = { proxyAddresses: addresses.map((addr) => addr.toLowerCase()) }
  try {
    const historyCall = request<HistoryQueryResponse>(subgraphUrl, historyQuery, params).then(
      (data) => ({
        networkId: network,
        positions: data.positions,
      }),
    )
    const positionsHistoryList = await historyCall.then(({ networkId, positions }) => {
      return positions
        .map((pos) => {
          return {
            networkId,
            id: pos.id,
            cumulativeDeposit: new BigNumber(pos.cumulativeDeposit),
            cumulativeWithdraw: new BigNumber(pos.cumulativeWithdraw),
            cumulativeFees: new BigNumber(pos.cumulativeFees),
            cumulativeFeesInQuoteToken: new BigNumber(pos.cumulativeFeesInQuoteToken),
            cumulativeDepositInQuoteToken: new BigNumber(pos.cumulativeDepositInQuoteToken),
            cumulativeWithdrawInQuoteToken: new BigNumber(pos.cumulativeWithdrawInQuoteToken),
            cumulativeDepositInCollateralToken: new BigNumber(
              pos.cumulativeDepositInCollateralToken,
            ),
            cumulativeWithdrawInCollateralToken: new BigNumber(
              pos.cumulativeWithdrawInCollateralToken,
            ),
            cumulativeFeesInCollateralToken: new BigNumber(pos.cumulativeFeesInCollateralToken),
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
