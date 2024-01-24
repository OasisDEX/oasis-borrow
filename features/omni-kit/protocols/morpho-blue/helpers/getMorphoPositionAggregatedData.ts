import BigNumber from 'bignumber.js'
import type { AjnaUnifiedHistoryEvent } from 'features/omni-kit/protocols/ajna/history'
import { unifiedHistoryItem } from 'features/omni-kit/protocols/ajna/history'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { mapPositionHistoryResponseEvent } from 'features/positionHistory/mapPositionHistoryResponseEvent'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface MorphoPositionAggregatedData {
  auctions: []
  history: AjnaUnifiedHistoryEvent[]
}

export const getMorpoPositionAggregatedData = async (
  proxy: string,
  networkId: OmniSupportedNetworkIds,
  collateralTokenAddress: string,
  quoteTokenAddress: string,
): Promise<MorphoPositionAggregatedData> => {
  const { response } = (await loadSubgraph('Morpho', 'getMorphoPositionAggregatedData', networkId, {
    dpmProxyAddress: proxy.toLowerCase(),
    collateralAddress: collateralTokenAddress.toLowerCase(),
    quoteAddress: quoteTokenAddress.toLowerCase(),
  })) as SubgraphsResponses['Morpho']['getMorphoPositionAggregatedData']
  const errors = []

  if (!response.summerEvents) errors.push('No history data found')

  if (errors.length) throw new Error([`Missing data for ${proxy} proxy:`, ...errors].join('\n'))

  return {
    auctions: [],
    history: [
      ...response.summerEvents.map((event) => ({
        ...unifiedHistoryItem,
        originationFee: new BigNumber(event.originationFee),
        originationFeeInQuoteToken: new BigNumber(event.originationFeeInQuoteToken),
        ...mapPositionHistoryResponseEvent(event),
      })),
    ].sort((a, b) => b.timestamp - a.timestamp),
  }
}
