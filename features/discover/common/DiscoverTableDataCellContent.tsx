import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import { DiscoverTableDataCellPill } from 'features/discover/common/DiscoverTableDataCellPill'
import { discoverFiltersAssetItems } from 'features/discover/filters'
import { parsePillAdditionalData } from 'features/discover/helpers'
import { DiscoverTableRowData } from 'features/discover/types'
import { formatCryptoBalance, formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Text } from 'theme-ui'

export function DiscoverTableDataCellContent({
  label,
  row,
  onPositionClick,
}: {
  label: string
  row: DiscoverTableRowData
  onPositionClick?: (cdpId: string) => void
}) {
  const { i18n, t } = useTranslation()
  const primitives = Object.keys(row)
    .filter((item) => typeof row[item] === 'string' || typeof row[item] === 'number')
    .reduce<{ [key: string]: string | number }>(
      (a, v) => ({ ...a, [v]: row[v] as string | number }),
      {},
    )

  switch (label) {
    case 'asset':
      const asset = Object.values(discoverFiltersAssetItems).filter(
        (item) => item.value === primitives.asset,
      )[0]

      return (
        <Flex sx={{ alignItems: 'center' }}>
          {asset && asset.icon && <Icon size={44} name={asset.icon} />}
          <Flex sx={{ flexDirection: 'column', ml: '10px' }}>
            <Text as="span" sx={{ fontSize: 4, fontWeight: 'semiBold' }}>
              {primitives.ilk ? primitives.ilk : asset ? asset.label : primitives.asset}
            </Text>
            {primitives.cdpId && (
              <Text as="span" sx={{ fontSize: 2, color: 'neutral80', whiteSpace: 'pre' }}>
                {t('position')} #{primitives.cdpId}
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
        <AppLink
          href={`/${primitives[label]}`}
          internalInNewTab={true}
          onClick={() => {
            onPositionClick && onPositionClick(String(primitives[label]))
          }}
        >
          <Button variant="tertiary">{t('discover.table.view-position')}</Button>
        </AppLink>
      )
    case 'collateralValue':
    case 'liquidationPrice':
    case 'maxLiquidationAmount':
    case 'netUSDValue':
    case 'nextOsmPrice':
      return <>${formatFiatBalance(new BigNumber(primitives[label]))}</>
    case 'pnl':
    case '30DayAvgApy':
      return <>{formatPercent(new BigNumber(primitives[label]), { precision: 2 })}</>
    case 'earningsToDate':
    case 'liquidity':
    case 'netValue':
    case 'vaultDebt':
      return <>{formatCryptoBalance(new BigNumber(primitives[label]))} DAI</>
    case 'currentMultiple':
      return <>{(primitives[label] as number)?.toFixed(2)}x</>
    case 'fundingCost':
    case 'variable':
      return <>{(primitives[label] as number)?.toFixed(2)}%</>
    case 'collateralLocked':
      return (
        <>
          {formatCryptoBalance(new BigNumber(primitives[label]))} {primitives.asset}
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
    case 'protection':
      return (
        <>
          {primitives.cdpId && primitives[label] >= 0 ? (
            <AppLink href={`/${primitives.cdpId}`} hash="protection" internalInNewTab={true}>
              <Button variant={primitives[label] > 0 ? 'actionActiveGreen' : 'action'}>
                {primitives[label] > 0
                  ? t('discover.table.protection-value', { protection: primitives[label] })
                  : t('discover.table.activate')}
              </Button>
            </AppLink>
          ) : (
            <Text as="span" sx={{ fontSize: 2, color: 'neutral80' }}>{t('discover.table.not-available')}</Text>
          )}
        </>
      )
    default:
      return <>{primitives[label]}</>
  }
}
