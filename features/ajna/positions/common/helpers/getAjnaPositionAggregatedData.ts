import BigNumber from 'bignumber.js'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import {
  AjnaUnifiedHistoryEvent,
  ajnaUnifiedHistoryItem,
} from 'features/ajna/history/ajnaUnifiedHistoryEvent'
import { mapAjnaAuctionResponse } from 'features/positionHistory/mapAjnaAuctionResponse'
import { mapPositionHistoryResponseEvent } from 'features/positionHistory/mapPositionHistoryResponseEvent'
import { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface AjnaPositionAggregatedDataAuctions {
  alreadyTaken: boolean
  collateral: BigNumber
  debtToCover: BigNumber
  endOfGracePeriod: number
  id: string
  inLiquidation: boolean
}

export interface AjnaPositionCumulatives {
  cumulativeDeposit: BigNumber
  cumulativeFees: BigNumber
  cumulativeWithdraw: BigNumber
}

export interface AjnaPositionAggregatedData {
  auctions: AjnaPositionAggregatedDataAuctions[]
  cumulatives: AjnaPositionCumulatives
  history: AjnaUnifiedHistoryEvent[]
}

export const getAjnaPositionAggregatedData = async (
  proxy: string,
): Promise<AjnaPositionAggregatedData> => {
  const { response } = (await loadSubgraph('Ajna', 'getAjnaPositionAggregatedData', {
    dpmProxyAddress: proxy.toLowerCase(),
  })) as SubgraphsResponses['Ajna']['getAjnaPositionAggregatedData']
  const errors = []

  if (!response.auctions) errors.push('No auctions data found')
  if (!response.borrowerEvents || !response.oasisEvents) errors.push('No history data found')

  if (errors.length) throw new Error([`Missing data for ${proxy} proxy:`, ...errors].join('\n'))

  return {
    cumulatives: {
      cumulativeDeposit: new BigNumber(response.account?.cumulativeDeposit || 0),
      cumulativeWithdraw: new BigNumber(response.account?.cumulativeWithdraw || 0),
      cumulativeFees: new BigNumber(response.account?.cumulativeFees || 0),
    },
    auctions: response.auctions.map(
      ({ alreadyTaken, collateral, debtToCover, endOfGracePeriod, id, inLiquidation }) => ({
        alreadyTaken,
        collateral: new BigNumber(collateral).shiftedBy(NEGATIVE_WAD_PRECISION),
        debtToCover: new BigNumber(debtToCover).shiftedBy(NEGATIVE_WAD_PRECISION),
        endOfGracePeriod: endOfGracePeriod * 1000,
        id,
        inLiquidation,
      }),
    ),
    history: [
      ...response.oasisEvents.map((event) => ({
        ...ajnaUnifiedHistoryItem,
        originationFee: new BigNumber(event.originationFee),
        ...mapPositionHistoryResponseEvent(event),
      })),
      ...response.borrowerEvents
        .filter((item) => item.auction && (item.kind === 'AuctionSettle' || item.kind === 'Kick'))
        .map((item) => ({ ...ajnaUnifiedHistoryItem, ...mapAjnaAuctionResponse(item) })),
    ].sort((a, b) => b.timestamp - a.timestamp),
  }
}
