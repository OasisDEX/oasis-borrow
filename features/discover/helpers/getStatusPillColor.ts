import type { pillColors } from 'components/assetsTable/cellComponents/AssetsTableDataCellPill'
import type { DiscoverTableStatusRowData } from 'features/discover/types'
import { DiscoverTableVaultStatus } from 'features/discover/types'

const statusColors: { [key in DiscoverTableVaultStatus]: keyof typeof pillColors } = {
  [DiscoverTableVaultStatus.LIQUIDATED]: 'critical',
  [DiscoverTableVaultStatus.BEING_LIQUIDATED]: 'critical',
  [DiscoverTableVaultStatus.TILL_LIQUIDATION]: 'success',
  [DiscoverTableVaultStatus.TO_STOP_LOSS]: 'interactive',
}

export function getStatusPillColor(status: DiscoverTableStatusRowData): keyof typeof pillColors {
  if (
    status.kind === DiscoverTableVaultStatus.TILL_LIQUIDATION &&
    status.additionalData?.tillLiquidation
  ) {
    return status.additionalData.tillLiquidation <= 10
      ? 'critical'
      : status.additionalData.tillLiquidation <= 25
      ? 'warning'
      : 'success'
  } else return statusColors[status.kind]
}
