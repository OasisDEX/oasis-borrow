import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { AppLink } from 'components/Links'
import {
  DiscoveryTableRowData,
  DiscoveryTableVaultActivity,
  DiscoveryTableVaultStatus,
} from 'features/discovery/types'
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

const activityColors: { [key in DiscoveryTableVaultActivity]: SxStyleProp } = {
  [DiscoveryTableVaultActivity.WITHDRAWN]: pillColors.warning,
  [DiscoveryTableVaultActivity.INCREASED_RISK]: pillColors.critical,
  [DiscoveryTableVaultActivity.DECREASED_RISK]: pillColors.success,
  [DiscoveryTableVaultActivity.CLOSED]: pillColors.faded,
  [DiscoveryTableVaultActivity.OPENED]: pillColors.interactive,
  [DiscoveryTableVaultActivity.DEPOSITED]: pillColors.interactive,
}
const statusColors: { [key in DiscoveryTableVaultStatus]: SxStyleProp } = {
  [DiscoveryTableVaultStatus.LIQUIDATED]: pillColors.critical,
  [DiscoveryTableVaultStatus.BEING_LIQUIDATED]: pillColors.warning,
  [DiscoveryTableVaultStatus.TILL_LIQUIDATION]: pillColors.success,
  [DiscoveryTableVaultStatus.TO_STOP_LOSS]: pillColors.interactive,
  [DiscoveryTableVaultStatus.CLOSED_LONG_TIME_AGO]: pillColors.faded,
}

export function DiscoveryTableDataCellContent({
  label,
  row,
}: {
  label: string
  row: DiscoveryTableRowData
}) {
  const { t } = useTranslation()

  switch (label) {
    case 'asset':
      return (
        <Flex sx={{ alignItems: 'center' }}>
          <Icon size={44} name={getToken(row.asset as string).iconCircle} />
          <Flex sx={{ flexDirection: 'column', ml: '10px' }}>
            <Text as="span" sx={{ fontSize: 4, fontWeight: 'semiBold' }}>
              {row.asset}
            </Text>
            {row.cid && (
              <Text as="span" sx={{ fontSize: 2, color: 'neutral80', whiteSpace: 'pre' }}>
                {t('discovery.table.vault-number', { cid: row.cid })}
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
            p: '4px 12px',
            fontSize: 1,
            fontWeight: 'semiBold',
            borderRadius: 'mediumLarge',
            whiteSpace: 'pre',
            ...(row.activity && { ...activityColors[row.activity?.kind] }),
            ...(row.status && { ...statusColors[row.status?.kind] }),
          }}
        >
          {t(`discovery.table.${label}.${row[label]?.kind}`, { ...row[label]?.additionalData })}
        </Text>
      )
    case 'cdpId':
      return (
        <AppLink href={`/${row?.cdpId}`}>
          <Button variant="tertiary">{t('discovery.table.view-position')}</Button>
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
      return <>${row[label]}</>
  }
}
