import { useTranslation } from 'next-i18next'
import React from 'react'

import { DefaultVaultHeaderProps } from '../../../../components/vault/DefaultVaultHeader'
import { VaultHeader, VaultIlkDetailsItem } from '../../../../components/vault/VaultHeader'
import { formatCryptoBalance, formatPercent } from '../../../../helpers/formatters/format'

export function GuniVaultHeader(props: DefaultVaultHeaderProps) {
  const {
    ilkData: { stabilityFee, debtFloor },
    id,
    header,
    token,
    priceInfo,
  } = props
  const { t } = useTranslation()
  return (
    <VaultHeader header={header} id={id} token={token} priceInfo={priceInfo}>
      <VaultIlkDetailsItem
        label={t('manage-vault.stability-fee')}
        value={`${formatPercent(stabilityFee.times(100), { precision: 2 })}`}
        tooltipContent={t('manage-multiply-vault.tooltip.stabilityFee')}
        styles={{
          tooltip: {
            left: ['auto', '-20px'],
            right: ['-0px', 'auto'],
          },
        }}
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.dust-limit')}
        value={`$${formatCryptoBalance(debtFloor)}`}
        tooltipContent={t('manage-multiply-vault.tooltip.dust-limit')}
        styles={{
          tooltip: {
            left: ['-80px', 'auto'],
            right: ['auto', '-32px'],
          },
        }}
      />
    </VaultHeader>
  )
}
