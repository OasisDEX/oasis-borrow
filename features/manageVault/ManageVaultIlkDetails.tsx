import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { Details } from '../../components/forms/Details'
import { ManageVaultState } from './manageVault'

export function ManageVaultIlkDetails({
  inputAmountsEmpty,
  isEditingStage,
  ilkData: { ilkDebtAvailable, liquidationRatio, stabilityFee, liquidationPenalty, debtFloor },
}: ManageVaultState) {
  const { t } = useTranslation()

  if (inputAmountsEmpty || !isEditingStage) return null
  return (
    <Details>
      <Details.Item
        label={t('manage-vault.dai-available')}
        value={`${formatCryptoBalance(ilkDebtAvailable)} DAI`}
      />
      <Details.Item
        label={t('manage-vault.min-collat-ratio')}
        value={`${formatPercent(liquidationRatio.times(100))}`}
      />
      <Details.Item
        label={t('manage-vault.stability-fee')}
        value={`${formatPercent(stabilityFee.times(100), { precision: 2 })}`}
      />
      <Details.Item
        label={t('manage-vault.liquidation-fee')}
        value={`${formatPercent(liquidationPenalty.times(100))}`}
      />
      <Details.Item
        label={t('manage-vault.dust-limit')}
        value={`${formatCryptoBalance(debtFloor)} DAI`}
      />
    </Details>
  )
}
