import type { MakerHistoryEvent } from 'features/omni-kit/protocols/maker/history/types'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { unifiedDefaultHistoryItem } from 'features/positionHistory/consts'
import { getAutomationEvents } from 'features/positionHistory/helpers'
import { mapPositionHistoryResponseEvent } from 'features/positionHistory/mapPositionHistoryResponseEvent'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface MorphoPositionAggregatedData {
  auction?: MakerHistoryEvent
  history: MakerHistoryEvent[]
}

export const getMakerPositionAggregatedData = async (
  proxy: string,
  networkId: OmniSupportedNetworkIds,
  collateralTokenAddress: string,
  debtTokenAddress: string,
  poolId: string,
): Promise<MorphoPositionAggregatedData> => {
  const { response } = (await loadSubgraph({
    subgraph: 'SummerEvents',
    method: 'getMakerSummerEvents',
    networkId,
    params: {
      proxy: '0xe08d6ba1109945322f8c824fb803851f2545ca18'.toLowerCase(),
      marketId: poolId.toLowerCase(),
    },
  })) as SubgraphsResponses['SummerEvents']['getMakerSummerEvents']

  const automationEvents = await getAutomationEvents({
    networkId,
    proxy,
    collateralTokenAddress,
    debtTokenAddress,
    poolId,
  })

  const errors = []

  if (!response.summerEvents) errors.push('No history data found')

  if (errors.length) throw new Error([`Missing data for ${proxy} proxy:`, ...errors].join('\n'))

  const history = [
    ...response.summerEvents.map((event) => ({
      ...unifiedDefaultHistoryItem,
      ...mapPositionHistoryResponseEvent(event),
    })),
    // ...response.borrowerEvents
    //   .filter((event) => event.kind === 'Liquidate')
    //   .map((event) => ({
    //     ...unifiedDefaultHistoryItem,
    //     ...mapMorphoLiquidationResponseEvent(event),
    //   })),
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
