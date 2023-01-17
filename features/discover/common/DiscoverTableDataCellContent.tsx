import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { DiscoverTableDataCellPill } from 'features/discover/common/DiscoverTableDataCellPill'
import { discoverFiltersAssetItems } from 'features/discover/filters'
import { parsePillAdditionalData } from 'features/discover/helpers'
import { DiscoverPages, DiscoverTableRowData } from 'features/discover/types'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Text } from 'theme-ui'

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
        <DiscoverTableDataCellPill status={row.status}>
          {t(`discover.table.status.${row.status?.kind}`, {
            ...parsePillAdditionalData(i18n.language, row.status),
          })}
        </DiscoverTableDataCellPill>
      )
    case 'activity':
      return (
        <DiscoverTableDataCellPill activity={row.activity}>
          {t(`discover.table.activity.${row.activity?.kind}`, {
            ...parsePillAdditionalData(i18n.language, row.activity),
          })}
        </DiscoverTableDataCellPill>
      )
    case 'cdpId':
      return (
        <a
          href={`/${row?.cdpId}`}
          target="_blank"
          onClick={() => {
            trackingEvents.discover.viewPosition(kind, row?.cdpId)
          }}
        >
          <Button variant="tertiary">{t('discover.table.view-position')}</Button>
        </a>
      )
    case 'collateralValue':
    case 'liquidationPrice':
    case 'maxLiquidationAmount':
    case 'nextOsmPrice':
      return <>${formatCryptoBalance(new BigNumber(row[label]))}</>
    case 'pnl':
    case '30DayAvgApy':
      return <>{formatPercent(new BigNumber(row[label]), { precision: 2 })}</>
    case 'earningsToDate':
    case 'netValue':
    case 'vaultDebt':
      return <>{formatCryptoBalance(new BigNumber(row[label]))} DAI</>
    case 'currentMultiple':
      return <>{(row[label] as number)?.toFixed(2)}x</>
    case 'variable':
      return <>{(row[label] as number)?.toFixed(2)}%</>
    case 'collateralLocked':
      return (
        <>
          {formatCryptoBalance(new BigNumber(row[label]))} {row.asset}
        </>
      )
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
