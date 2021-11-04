import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { VaultHeader, VaultIlkDetailsItem } from '../../../../components/vault/VaultHeader'
import { formatCryptoBalance, formatPercent } from '../../../../helpers/formatters/format'
import { CommonVaultState } from '../../../../helpers/types'

export function GuniVaultHeader(props: CommonVaultState & { header: string; id?: BigNumber }) {
  const {
    ilkData: { stabilityFee, debtFloor },
    id,
    header,
  } = props
  const { t } = useTranslation()
  return (
    <VaultHeader header={header} id={id}>
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
