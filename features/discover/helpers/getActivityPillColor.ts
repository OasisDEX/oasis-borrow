import { pillColors } from 'components/assetsTable/cellComponents/AssetsTableDataCellPill'
import { DiscoverTableActivityRowData, DiscoverTableVaultActivity } from 'features/discover/types'

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
