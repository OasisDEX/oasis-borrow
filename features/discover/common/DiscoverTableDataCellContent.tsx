import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import { discoverFiltersAssetItems } from 'features/discover/filters'
import {
  DiscoverPages,
  DiscoverTableRowData,
  DiscoverTableVaultActivity,
  DiscoverTableVaultStatus,
} from 'features/discover/types'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, SxStyleProp, Text } from 'theme-ui'

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
  [DiscoverTableVaultStatus.BEING_LIQUIDATED]: pillColors.warning,
  [DiscoverTableVaultStatus.TILL_LIQUIDATION]: pillColors.success,
  [DiscoverTableVaultStatus.TO_STOP_LOSS]: pillColors.interactive,
  [DiscoverTableVaultStatus.CLOSED_LONG_TIME_AGO]: pillColors.faded,
}

export function DiscoverTableDataCellContent({
  kind,
  label,
  row,
}: {
  kind: DiscoverPages
  label: string
  row: DiscoverTableRowData
}) {
  const { t } = useTranslation()

  switch (label) {
    case 'asset':
      const asset = Object.values(discoverFiltersAssetItems).filter(
        (item) => item.value === row.asset,
      )[0]

      return (
        <Flex sx={{ alignItems: 'center' }}>
          {asset && asset.icon && <Icon size={44} name={asset.icon} />}
          <Flex sx={{ flexDirection: 'column', ml: '10px' }}>
            <Text as="span" sx={{ fontSize: 4, fontWeight: 'semiBold' }}>
              {asset ? asset.label : row.asset}
            </Text>
            {row.cdpId && (
              <Text as="span" sx={{ fontSize: 2, color: 'neutral80', whiteSpace: 'pre' }}>
                {t('discover.table.vault-number', { cdpId: row.cdpId })}
              </Text>
            )}
          </Flex>
        </Flex>
      )
    case 'activity':
    case 'status':
      return (
        <Text
          as="span"
          sx={{
            p: '6px 12px',
            fontSize: 1,
            fontWeight: 'semiBold',
            borderRadius: 'large',
            whiteSpace: 'pre',
            ...(row.activity && { ...activityColors[row.activity?.kind] }),
            ...(row.status && { ...statusColors[row.status?.kind] }),
          }}
        >
          {t(`discover.table.${label}.${row[label]?.kind}`, { ...row[label]?.additionalData })}
        </Text>
      )
    case 'cdpId':
      return (
        <AppLink
          href={`/${row?.cdpId}`}
          onClick={() => {
            trackingEvents.discover.viewPosition(kind, row?.cdpId)
          }}
        >
          <Button variant="tertiary">{t('discover.table.view-position')}</Button>
        </AppLink>
      )
    case 'collateralValue':
    case 'liquidationPrice':
    case 'maxLiquidationAmount':
    case 'nextOsmPrice':
    case 'pnl':
      return <>${formatCryptoBalance(new BigNumber(row[label]))}</>
    case 'earningsToDate':
    case 'netValue':
    case 'vaultDebt':
      return <>{formatCryptoBalance(new BigNumber(row[label]))} DAI</>
    case 'currentMultiple':
      return <>{(row.currentMultiple as number)?.toFixed(2)}x</>
    case '30DayAvgApy':
      return <>{formatPercent(new BigNumber(row[label]), { precision: 2 })}</>
    case 'colRatio':
      return (
        <>
          {row.colRatio && (
            <Text as="span" sx={{ color: row.colRatio.isAtRisk ? 'warning100' : 'success100' }}>
              {formatPercent(new BigNumber(row.colRatio.level), { precision: 2 })}
            </Text>
          )}
        </>
      )
    default:
      return <>{row[label]}</>
  }
}
