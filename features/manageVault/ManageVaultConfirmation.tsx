import { Details } from 'components/forms/Details'
import { TxStatusCardProgress } from 'features/openVault/TxStatusCard'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

export function ManageVaultConfirmation({
  balanceInfo: { collateralBalance },
  depositAmount,
  generateAmount,
  paybackAmount,
  withdrawAmount,
  vault: { token },
  afterCollateralizationRatio,
  afterLiquidationPrice,
  vaultWillBeAtRiskLevelDanger,
  vaultWillBeAtRiskLevelWarning,
}: ManageVaultState) {
  const { t } = useTranslation()
  const walletBalance = formatCryptoBalance(collateralBalance)
  const depositCollateral = formatCryptoBalance(depositAmount || zero)
  const withdrawingCollateral = formatCryptoBalance(withdrawAmount || zero)
  const remainingInWallet = formatCryptoBalance(
    depositAmount ? collateralBalance.minus(depositAmount) : collateralBalance,
  )
  const daiToBeGenerated = formatCryptoBalance(generateAmount || zero)
  const daiPayingBack = formatCryptoBalance(paybackAmount || zero)

  const afterCollRatio = afterCollateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(afterCollateralizationRatio.times(100), { precision: 2 })

  const afterLiqPrice = formatAmount(afterLiquidationPrice, 'USD')

  const vaultRiskColor = vaultWillBeAtRiskLevelDanger
    ? 'banner.danger'
    : vaultWillBeAtRiskLevelWarning
    ? 'banner.warning'
    : 'onSuccess'

  return (
    <Grid>
      <Details>
        <Details.Item header={t('system.in-your-wallet')} value={`${walletBalance} ${token}`} />

        {depositAmount?.gt(zero) && (
          <Details.Item header={t('moving-into-vault')} value={`${depositCollateral} ${token}`} />
        )}
        {withdrawAmount?.gt(zero) && (
          <Details.Item
            header={t('moving-out-vault')}
            value={`${withdrawingCollateral} ${token}`}
          />
        )}
        <Details.Item header={t('remaining-in-wallet')} value={`${remainingInWallet} ${token}`} />
        {generateAmount?.gt(zero) && (
          <Details.Item header={t('dai-being-generated')} value={`${daiToBeGenerated} DAI`} />
        )}
        {paybackAmount?.gt(zero) && (
          <Details.Item header={t('dai-paying-back-label')} value={`${daiPayingBack} DAI`} />
        )}
        <Details.Item
          header={t('system.collateral-ratio')}
          value={<Text sx={{ color: vaultRiskColor }}>{afterCollRatio}</Text>}
        />
        <Details.Item header={t('system.liquidation-price')} value={`$${afterLiqPrice}`} />
      </Details>
    </Grid>
  )
}

export function ManageVaultConfirmationStatus({
  stage,
  etherscan,
  manageTxHash,
}: ManageVaultState) {
  const { t } = useTranslation()

  if (stage === 'manageInProgress') {
    return (
      <TxStatusCardProgress
        text={t('changing-vault')}
        etherscan={etherscan!}
        txHash={manageTxHash!}
      />
    )
  }
  if (stage === 'manageSuccess') {
    return (
      <TxStatusCardProgress
        text={t('vault-changed')}
        etherscan={etherscan!}
        txHash={manageTxHash!}
      />
    )
  }
  return null
}
