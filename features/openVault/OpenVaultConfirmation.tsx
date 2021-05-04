import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Grid, SxStyleProp, Text } from 'theme-ui'

import { OpenVaultState } from './openVault'
import { TxStatusCardProgress, TxStatusCardSuccess } from './TxStatusCard'

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
export function OpenVaultConfirmation({
  balanceInfo: { collateralBalance },
  depositAmount,
  generateAmount,
  token,
  afterCollateralizationRatio,
  afterLiquidationPrice,
  collateralBalanceRemaining,
  vaultWillBeAtRiskLevelWarning,
  vaultWillBeAtRiskLevelDanger,
}: OpenVaultState) {
  const walletBalance = formatCryptoBalance(collateralBalance)
  const intoVault = formatCryptoBalance(depositAmount || zero)
  const remainingInWallet = formatCryptoBalance(collateralBalanceRemaining)
  const daiToBeGenerated = formatCryptoBalance(generateAmount || zero)
  const afterCollRatio = afterCollateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(afterCollateralizationRatio.times(100), { precision: 2 })

  const afterLiqPrice = formatAmount(afterLiquidationPrice, 'USD')
  const { t } = useTranslation()

  const vaultRiskColor = vaultWillBeAtRiskLevelDanger
    ? 'banner.danger'
    : vaultWillBeAtRiskLevelWarning
    ? 'banner.warning'
    : 'onSuccess'

  return (
    <Grid>
      <Card bg="secondaryAlt" sx={{ border: 'none' }}>
        <Grid columns="1fr 1fr">
          <Label>{t('system.in-your-wallet')}</Label>
          <Value>
            {walletBalance} {token}
          </Value>

          <Label>{t('moving-into-vault')}</Label>
          <Value>
            {intoVault} {token}
          </Value>

          <Label>{t('remaining-in-wallet')}</Label>
          <Value>
            {remainingInWallet} {token}
          </Value>

          <Label>{t('dai-being-generated')}</Label>
          <Value>{daiToBeGenerated} DAI</Value>

          <Label>{t('system.collateral-ratio')}</Label>
          <Value sx={{ color: vaultRiskColor }}>{afterCollRatio}</Value>

          <Label>{t('system.liquidation-price')}</Label>
          <Value>${afterLiqPrice}</Value>
        </Grid>
      </Card>
    </Grid>
  )
}

export function OpenVaultStatus({ stage, id, etherscan, openTxHash }: OpenVaultState) {
  const { t } = useTranslation()
  if (stage === 'openInProgress') {
    return (
      <TxStatusCardProgress
        text={t('creating-your-vault')}
        etherscan={etherscan!}
        txHash={openTxHash!}
      />
    )
  }
  if (stage === 'openSuccess') {
    return (
      <TxStatusCardSuccess
        text={t('vault-created', { id: id?.toString() })}
        etherscan={etherscan!}
        txHash={openTxHash!}
      />
    )
  }
  return null
}
