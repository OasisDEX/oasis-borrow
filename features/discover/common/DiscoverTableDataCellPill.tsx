import {
  DiscoverTableActivityRowData,
  DiscoverTableStatusRowData,
  DiscoverTableVaultActivity,
  DiscoverTableVaultStatus,
} from 'features/discover/types'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { SxStyleProp, Text } from 'theme-ui'

const pillColors: { [key: string]: SxStyleProp } = {
  critical: { color: 'critical100', backgroundColor: 'critical10' },
  warning: { color: 'warning100', backgroundColor: 'warning10' },
  success: { color: 'success100', backgroundColor: 'success10' },
  interactive: { color: 'interactive100', backgroundColor: 'interactive10' },
  faded: { color: 'primary30', backgroundColor: 'secondary60' },
}

const activityColors: { [key in DiscoverTableVaultActivity]: SxStyleProp } = {
  [DiscoverTableVaultActivity.WITHDRAWN]: pillColors.warning,
  [DiscoverTableVaultActivity.INCREASED_RISK]: pillColors.critical,
  [DiscoverTableVaultActivity.DECREASED_RISK]: pillColors.success,
  [DiscoverTableVaultActivity.CLOSED]: pillColors.faded,
  [DiscoverTableVaultActivity.OPENED]: pillColors.interactive,
  [DiscoverTableVaultActivity.DEPOSITED]: pillColors.interactive,
}
const statusColors: { [key in DiscoverTableVaultStatus]: SxStyleProp } = {
  [DiscoverTableVaultStatus.LIQUIDATED]: pillColors.critical,
  [DiscoverTableVaultStatus.BEING_LIQUIDATED]: pillColors.critical,
  [DiscoverTableVaultStatus.TILL_LIQUIDATION]: pillColors.success,
  [DiscoverTableVaultStatus.TO_STOP_LOSS]: pillColors.interactive,
}

function getStatusPillStyle(status: DiscoverTableStatusRowData): SxStyleProp {
  if (
    status.kind === DiscoverTableVaultStatus.TILL_LIQUIDATION &&
    status.additionalData?.tillLiquidation
  ) {
    return status.additionalData.tillLiquidation <= 10
      ? pillColors.critical
      : status.additionalData.tillLiquidation <= 25
      ? pillColors.warning
      : pillColors.success
  } else return statusColors[status.kind]
}

export function DiscoverTableDataCellPill({
  activity,
  status,
  children,
}: {
  activity?: DiscoverTableActivityRowData
  status?: DiscoverTableStatusRowData
} & WithChildren) {
  return (
    <Text
      as="span"
      sx={{
        p: '6px 12px',
        fontSize: 1,
        fontWeight: 'semiBold',
        borderRadius: 'large',
        whiteSpace: 'pre',
        ...(activity && { ...activityColors[activity.kind] }),
        ...(status && { ...getStatusPillStyle(status) }),
      }}
    >
      {children}
    </Text>
  )
}
