import type { pillColors } from 'components/assetsTable/cellComponents/AssetsTableDataCellPill'
import type { DiscoverTableActivityRowData } from 'features/discover/types'
import { DiscoverTableVaultActivity } from 'features/discover/types'

const activityColors: { [key in DiscoverTableVaultActivity]: keyof typeof pillColors } = {
  [DiscoverTableVaultActivity.WITHDRAWN]: 'warning',
  [DiscoverTableVaultActivity.INCREASED_RISK]: 'critical',
  [DiscoverTableVaultActivity.DECREASED_RISK]: 'success',
  [DiscoverTableVaultActivity.CLOSED]: 'faded',
  [DiscoverTableVaultActivity.OPENED]: 'interactive',
  [DiscoverTableVaultActivity.DEPOSITED]: 'interactive',
}

export function getActivityPillColor(
  activity: DiscoverTableActivityRowData,
): keyof typeof pillColors {
  return activityColors[activity.kind]
}
