import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, SxStyleProp, Text } from 'theme-ui'

import { OpenVaultState } from './openVault'

export function Label({ children, sx }: React.PropsWithChildren<{ sx?: SxStyleProp }>) {
  return (
    <Text variant="paragraph3" sx={{ color: 'mutedAlt', whiteSpace: 'nowrap', ...sx }}>
      {children}
    </Text>
  )
}
export function Value({ children, sx }: React.PropsWithChildren<{ sx?: SxStyleProp }>) {
  return (
    <Text variant="paragraph3" sx={{ textAlign: 'right', fontWeight: 'semiBold', ...sx }}>
      {children}
    </Text>
  )
}
export function OpenVaultIlkDetails({
  inputAmountsEmpty,
  isEditingStage,
  ilkData: { ilkDebtAvailable, liquidationRatio, stabilityFee, liquidationPenalty, debtFloor },
}: OpenVaultState) {
  const { t } = useTranslation()

  if (inputAmountsEmpty || !isEditingStage) return null
  return (
    <Card bg="secondaryAlt" sx={{ border: 'none' }}>
      <Grid columns={'auto 1fr'}>
        <Label>{t('manage-vault.dai-available')}</Label>
        <Value>{`${formatCryptoBalance(ilkDebtAvailable)} DAI`}</Value>

        <Label>{t('manage-vault.min-collat-ratio')}</Label>
        <Value>{`${formatPercent(liquidationRatio.times(100), { precision: 2 })}`}</Value>

        <Label>{t('manage-vault.stability-fee')}</Label>
        <Value>{`${formatPercent(stabilityFee.times(100), { precision: 2 })}`}</Value>

        <Label>{t('manage-vault.liquidation-fee')}</Label>
        <Value>{`${formatPercent(liquidationPenalty.times(100), { precision: 2 })}`}</Value>

        <Label>{t('manage-vault.dust-limit')}</Label>
        <Value>{`${formatCryptoBalance(debtFloor)} DAI`}</Value>
      </Grid>
    </Card>
  )
}
