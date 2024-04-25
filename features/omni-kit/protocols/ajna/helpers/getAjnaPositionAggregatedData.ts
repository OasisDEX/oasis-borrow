import BigNumber from 'bignumber.js'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import { ajnaDefaultHistoryEvent } from 'features/omni-kit/protocols/ajna/history'
import { mapAjnaAuctionResponse } from 'features/omni-kit/protocols/ajna/history/mapAjnaAuctionResponse'
import type { AjnaHistoryEvent } from 'features/omni-kit/protocols/ajna/history/types'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { mapPositionHistoryResponseEvent } from 'features/positionHistory/mapPositionHistoryResponseEvent'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface AjnaPositionAggregatedDataAuctions {
  collateral: BigNumber
  debtToCover: BigNumber
  id: string
  inLiquidation: boolean
}

export interface AjnaPositionAggregatedData {
  auctions: AjnaPositionAggregatedDataAuctions[]
  history: AjnaHistoryEvent[]
}

export const getAjnaPositionAggregatedData = async (
  proxy: string,
  networkId: OmniSupportedNetworkIds,
  collateralTokenAddress: string,
  quoteTokenAddress: string,
): Promise<AjnaPositionAggregatedData> => {
  const { response } = (await loadSubgraph({
    subgraph: 'Ajna',
    method: 'getAjnaPositionAggregatedData',
    networkId,
    params: {
      dpmProxyAddress: proxy.toLowerCase(),
      collateralAddress: collateralTokenAddress.toLowerCase(),
      quoteAddress: quoteTokenAddress.toLowerCase(),
    },
  })) as SubgraphsResponses['Ajna']['getAjnaPositionAggregatedData']
  const errors = []

  if (!response.auctions) errors.push('No auctions data found')
  if (!response.borrowerEvents || !response.oasisEvents) errors.push('No history data found')

  if (errors.length) throw new Error([`Missing data for ${proxy} proxy:`, ...errors].join('\n'))

  return {
    auctions: response.auctions.map(({ collateral, debtToCover, id, inLiquidation }) => ({
      collateral: new BigNumber(collateral).shiftedBy(NEGATIVE_WAD_PRECISION),
      debtToCover: new BigNumber(debtToCover).shiftedBy(NEGATIVE_WAD_PRECISION),
      id,
      inLiquidation,
    })),
    history: [
      ...response.oasisEvents.map((event) => ({
        ...ajnaDefaultHistoryEvent,
        originationFee: new BigNumber(event.originationFee),
        originationFeeInQuoteToken: new BigNumber(event.originationFeeInQuoteToken),
        interestRate: new BigNumber(event.interestRate).shiftedBy(NEGATIVE_WAD_PRECISION),
        ...mapPositionHistoryResponseEvent(event),
      })),
      ...response.borrowerEvents
        .filter((item) => item.auction && (item.kind === 'AuctionSettle' || item.kind === 'Kick'))
        .map((item) => ({ ...ajnaDefaultHistoryEvent, ...mapAjnaAuctionResponse(item) })),
    ].sort((a, b) => b.timestamp - a.timestamp),
  }
}
