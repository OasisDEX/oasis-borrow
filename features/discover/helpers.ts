import { Pages } from 'analytics/analytics'
import { DiscoverFiltersList } from 'features/discover/meta'
import {
  DiscoverPages,
  DiscoverTableActivityRowData,
  DiscoverTableRowData,
  DiscoverTableStatusRowData,
} from 'features/discover/types'
import { timeAgo } from 'utils'

export const DISCOVER_URL = '/discover'

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

export function getDefaultSettingsState({
  filters,
  kind,
}: {
  filters: DiscoverFiltersList
  kind: DiscoverPages
}) {
  return {
    ...Object.keys(filters).reduce((o, key) => ({ ...o, [key]: filters[key].options[0].value }), {}),
    table: kind,
  }
}

export function getRowKey(i: number, row: DiscoverTableRowData) {
  return [...(row.asset ? [row.asset] : []), ...(row.cdpId ? [row.cdpId] : []), i].join('-')
}

export function parsePillAdditionalData(
  lang: string,
  content?: DiscoverTableActivityRowData | DiscoverTableStatusRowData,
) {
  return {
    ...content?.additionalData,
    ...(content?.additionalData?.timestamp && {
      timeAgo: timeAgo({
        lang,
        to: new Date(Number(content.additionalData?.timestamp)),
      }),
    }),
  }
}
