import { MixpanelPages } from 'analytics/types'
import { DiscoverPages } from 'features/discover/types'

export function getDiscoverMixpanelPage(kind: DiscoverPages): MixpanelPages {
  switch (kind) {
    case DiscoverPages.HIGHEST_RISK_POSITIONS:
      return MixpanelPages.DiscoverHighestRiskPositions
    case DiscoverPages.HIGHEST_MULTIPLY_PNL:
      return MixpanelPages.DiscoverHighestMultiplyPnl
    case DiscoverPages.MOST_YIELD_EARNED:
      return MixpanelPages.DiscoverMostYieldEarned
    case DiscoverPages.LARGEST_DEBT:
      return MixpanelPages.DiscoverLargestDebt
    default:
      return MixpanelPages.DiscoverOasis
  }
}
