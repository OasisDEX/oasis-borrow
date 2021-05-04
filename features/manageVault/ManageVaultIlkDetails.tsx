import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid } from 'theme-ui'

import { DetailsItem } from '../../components/forms/DetailsItem'
import { ManageVaultState } from './manageVault'

export function ManageVaultIlkDetails({
  inputAmountsEmpty,
  isEditingStage,
  ilkData: { ilkDebtAvailable, liquidationRatio, stabilityFee, liquidationPenalty, debtFloor },
}: ManageVaultState) {
  const { t } = useTranslation()

  if (inputAmountsEmpty || !isEditingStage) return null
  return (
    <Card bg="secondaryAlt" sx={{ border: 'none' }}>
      <Grid columns={'auto 1fr'}>
        <DetailsItem
          header={t('manage-vault.dai-available')}
          value={`${formatCryptoBalance(ilkDebtAvailable)} DAI`}
        />
        <DetailsItem
          header={t('manage-vault.min-collat-ratio')}
          value={`${formatPercent(liquidationRatio.times(100), { precision: 2 })}`}
        />
        <DetailsItem
          header={t('manage-vault.stability-fee')}
          value={`${formatPercent(stabilityFee.times(100), { precision: 2 })}`}
        />
        <DetailsItem
          header={t('manage-vault.liquidation-fee')}
          value={`${formatPercent(liquidationPenalty.times(100), { precision: 2 })}`}
        />
        <DetailsItem
          header={t('manage-vault.dust-limit')}
          value={`${formatCryptoBalance(debtFloor)} DAI`}
        />
      </Grid>
    </Card>
  )
}
