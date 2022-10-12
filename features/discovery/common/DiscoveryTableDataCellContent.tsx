import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { AppLink } from 'components/Links'
import { DiscoveryTableRowData, DiscoveryTableVaultStatus } from 'features/discovery/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
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
            ...(row.status && { ...statusColors[row.status?.kind] }),
          }}
        >
          {t(`discovery.table.status.${row.status?.kind}`, { ...row.status?.additionalData })}
        </Text>
      )
    case 'cid':
      return (
        <AppLink href={`/${row?.cid}`}>
          <Button variant="tertiary">{t('discovery.table.view-position')}</Button>
        </AppLink>
      )
    case 'liquidationPrice':
    case 'nextOsmPrice':
    case 'maxLiquidationAmount':
      return <>${formatCryptoBalance(new BigNumber(row[label]))}</>
    default:
      return <>{`${row[label]}`}</>
  }
}
