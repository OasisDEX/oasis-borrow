import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

export function ManageVaultIlkDetails({
  showIlkDetails,
  isEditingStage,
  ilkData: { ilkDebtAvailable, liquidationRatio, stabilityFee, liquidationPenalty, debtFloor },
}: ManageVaultState) {
  const { t } = useTranslation()

  if (!showIlkDetails || !isEditingStage) return null
  return (
    <Card bg="secondaryAlt" sx={{ border: 'none' }}>
      <Grid columns={'2fr 3fr'}>
        <>
          <Text sx={{ fontSize: 2 }}>{t('manage-vault.dai-available')}</Text>
          <Text sx={{ fontSize: 2, fontWeight: 'semiBold', textAlign: 'end' }}>{`${formatAmount(
            ilkDebtAvailable,
            'DAI',
          )} DAI`}</Text>
        </>

        <>
          <Text sx={{ fontSize: 2 }}>{t('manage-vault.min-collat-ratio')}</Text>
          <Text
            sx={{ fontSize: 2, fontWeight: 'semiBold', textAlign: 'end' }}
          >{`${formatPercent(liquidationRatio.times(100), { precision: 2 })}`}</Text>
        </>

        <>
          <Text sx={{ fontSize: 2 }}>{t('manage-vault.stability-fee')}</Text>
          <Text
            sx={{ fontSize: 2, fontWeight: 'semiBold', textAlign: 'end' }}
          >{`${formatPercent(stabilityFee.times(100), { precision: 2 })}`}</Text>
        </>

        <>
          <Text sx={{ fontSize: 2 }}>{t('manage-vault.liquidation-fee')}</Text>
          <Text
            sx={{ fontSize: 2, fontWeight: 'semiBold', textAlign: 'end' }}
          >{`${formatPercent(liquidationPenalty.times(100), { precision: 2 })}`}</Text>
        </>

        <>
          <Text sx={{ fontSize: 2 }}>{t('manage-vault.dust-limit')}</Text>
          <Text sx={{ fontSize: 2, fontWeight: 'semiBold', textAlign: 'end' }}>{`${formatAmount(
            debtFloor,
            'DAI',
          )} DAI`}</Text>
        </>
      </Grid>
    </Card>
  )
}
