import { mapMorphoLiquidationResponseEvent } from 'features/omni-kit/protocols/morpho-blue/history/mapMorphoLiquidationResponseEvent'
import type { MorphoHistoryEvent } from 'features/omni-kit/protocols/morpho-blue/history/types'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { unifiedDefaultHistoryItem } from 'features/positionHistory/consts'
import { getAutomationEvents } from 'features/positionHistory/helpers'
import { mapPositionHistoryResponseEvent } from 'features/positionHistory/mapPositionHistoryResponseEvent'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface MorphoPositionAggregatedData {
  auction?: MorphoHistoryEvent
  history: MorphoHistoryEvent[]
}

export const getMorpoPositionAggregatedData = async (
  proxy: string,
  networkId: OmniSupportedNetworkIds,
  collateralTokenAddress: string,
  debtTokenAddress: string,
  poolId: string,
): Promise<MorphoPositionAggregatedData> => {
  const { response } = (await loadSubgraph({
    subgraph: 'Morpho',
    method: 'getMorphoPositionAggregatedData',
    networkId,
    params: {
      dpmProxyAddress: proxy.toLowerCase(),
      collateralAddress: collateralTokenAddress.toLowerCase(),
      quoteAddress: debtTokenAddress.toLowerCase(),
    },
  })) as SubgraphsResponses['Morpho']['getMorphoPositionAggregatedData']

  const automationEvents = await getAutomationEvents({
    networkId,
    proxy,
    collateralTokenAddress,
    debtTokenAddress,
    poolId,
  })

  const errors = []

  if (!response.summerEvents || !response.borrowerEvents) errors.push('No history data found')

  if (errors.length) throw new Error([`Missing data for ${proxy} proxy:`, ...errors].join('\n'))

  const history = [
    ...response.summerEvents.map((event) => ({
      ...unifiedDefaultHistoryItem,
      ...mapPositionHistoryResponseEvent(event),
    })),
    ...response.borrowerEvents
      .filter((event) => event.kind === 'Liquidate')
      .map((event) => ({
        ...unifiedDefaultHistoryItem,
        ...mapMorphoLiquidationResponseEvent(event),
      })),
    ...automationEvents.map((item) => ({ ...unifiedDefaultHistoryItem, ...item })),
  ].sort((a, b) => b.timestamp - a.timestamp)

  // assumption that when liquidation happen there won't be any events afterward
  // if there will be additional event like liquidation -> repay / withdraw
  // we will need to adjust offset (index) in logic below
  const auction = history[0]?.kind === 'Liquidate' ? history[0] : undefined

  return {
    auction,
    history,
  }
}
