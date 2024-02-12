import { unifiedDefaultHistoryItem } from 'features/positionHistory/consts'
import { zero } from 'helpers/zero'

export const morphoDefaultHistoryEvent = {
  ...unifiedDefaultHistoryItem,
  repaidAssets: zero,
  quoteRepaid: zero,
}
