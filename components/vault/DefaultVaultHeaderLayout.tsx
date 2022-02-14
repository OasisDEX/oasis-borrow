import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { formatCryptoBalance, formatPercent } from '../../helpers/formatters/format'
import { VaultHeaderAutomation, VaultIlkDetailsItem } from './VaultHeader'

export interface DefaultVaultHeaderLayoutProps {
  id: BigNumber
  stabilityFee: BigNumber
  debtFloor: BigNumber
  liquidationPenalty?: BigNumber
  liquidationRatio?: BigNumber
}

export function DefaultVaultHeaderLayout({
  id,
  stabilityFee,
  debtFloor,
  liquidationPenalty,
  liquidationRatio,
}: DefaultVaultHeaderLayoutProps) {
  const { t } = useTranslation()
  return (
    <VaultHeaderAutomation id={id}>
      <VaultIlkDetailsItem
        label={t('manage-vault.stability-fee')}
        value={`${formatPercent(stabilityFee.times(100), { precision: 2 })}`}
        tooltipContent={t('manage-multiply-vault.tooltip.stabilityFee')}
        styles={{
          tooltip: {
            left: ['auto', '-20px'],
            right: ['0px', 'auto'],
          },
        }}
      />
      {liquidationPenalty && (
        <VaultIlkDetailsItem
          label={t('manage-vault.liquidation-fee')}
          value={`${formatPercent(liquidationPenalty.times(100))}`}
          tooltipContent={t('manage-multiply-vault.tooltip.liquidationFee')}
        />
      )}
      {liquidationRatio && (
        <VaultIlkDetailsItem
          label={t('manage-vault.min-collat-ratio')}
          value={`${formatPercent(liquidationRatio.times(100))}`}
          tooltipContent={t('manage-multiply-vault.tooltip.min-collateral')}
          styles={{
            tooltip: {
              left: 'auto',
              right: ['10px', '-154px'],
            },
          }}
        />
      )}
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
    </VaultHeaderAutomation>
  )
}
