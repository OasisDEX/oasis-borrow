import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
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

export interface AjnaPositionAggregatedData {
  auctions: AjnaPositionAggregatedDataAuctions[]
  history: AjnaUnifiedHistoryEvent[]
}

export const getAjnaPositionAggregatedData = async (
  proxy: string,
  networkId: NetworkIds,
): Promise<AjnaPositionAggregatedData> => {
  const { response } = (await loadSubgraph('Ajna', 'getAjnaPositionAggregatedData', networkId, {
    dpmProxyAddress: proxy.toLowerCase(),
  })) as SubgraphsResponses['Ajna']['getAjnaPositionAggregatedData']
  const errors = []

  if (!response.auctions) errors.push('No auctions data found')
  if (!response.borrowerEvents || !response.oasisEvents) errors.push('No history data found')

  if (errors.length) throw new Error([`Missing data for ${proxy} proxy:`, ...errors].join('\n'))

  return {
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
        originationFeeInQuoteToken: new BigNumber(event.originationFeeInQuoteToken),
        ...mapPositionHistoryResponseEvent(event),
      })),
      ...response.borrowerEvents
        .filter((item) => item.auction && (item.kind === 'AuctionSettle' || item.kind === 'Kick'))
        .map((item) => ({ ...ajnaUnifiedHistoryItem, ...mapAjnaAuctionResponse(item) })),
    ].sort((a, b) => b.timestamp - a.timestamp),
  }
}
