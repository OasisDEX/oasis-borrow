import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import { DiscoverTableDataCellPill } from 'features/discover/common/DiscoverTableDataCellPill'
import { discoverFiltersAssetItems } from 'features/discover/filters'
import { DiscoverPages, DiscoverTableRowData } from 'features/discover/types'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Text } from 'theme-ui'
import { timeAgo } from 'utils'

export function DiscoverTableDataCellContent({
  kind,
  label,
  row,
}: {
  kind: DiscoverPages
  label: string
  row: DiscoverTableRowData
}) {
  const { i18n, t } = useTranslation()

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
    case 'status':
      return (
        <DiscoverTableDataCellPill status={row.status?.kind}>
          {t(`discover.table.status.${row.status?.kind}`, { ...row.status?.additionalData })}
        </DiscoverTableDataCellPill>
      )
    case 'activity':
      const additionalData = {
        ...row.activity?.additionalData,
        ...(row.activity?.additionalData?.timestamp && {
          timeAgo: timeAgo({
            lang: i18n.language,
            to: new Date(row.activity?.additionalData?.timestamp),
          }),
        }),
      }

      return (
        <DiscoverTableDataCellPill activity={row.activity?.kind}>
          {t(`discover.table.activity.${row.activity?.kind}`, { ...additionalData })}
        </DiscoverTableDataCellPill>
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
            <Text
              as="span"
              sx={{
                color: row.colRatio.isAtRiskDanger
                  ? 'critical100'
                  : row.colRatio.isAtRiskWarning
                  ? 'warning100'
                  : 'success100',
              }}
            >
              {formatPercent(new BigNumber(row.colRatio.level), { precision: 2 })}
            </Text>
          )}
        </>
      )
    default:
      return <>{row[label]}</>
  }
}
