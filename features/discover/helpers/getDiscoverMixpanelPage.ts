import { Pages } from 'analytics/analytics'
import { DiscoverPages } from 'features/discover/types'

export function getDiscoverMixpanelPage(kind: DiscoverPages): Pages {
  switch (kind) {
    case DiscoverPages.HIGHEST_RISK_POSITIONS:
      return Pages.DiscoverHighestRiskPositions
    case DiscoverPages.HIGHEST_MULTIPLY_PNL:
      return Pages.DiscoverHighestMultiplyPnl
    case DiscoverPages.MOST_YIELD_EARNED:
      return Pages.DiscoverMostYieldEarned
    case DiscoverPages.LARGEST_DEBT:
      return Pages.DiscoverLargestDebt
    default:
      return Pages.DiscoverOasis
  }
}
