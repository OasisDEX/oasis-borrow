import { Icon } from '@makerdao/dai-ui-icons'
import { DetailsItem } from 'components/forms/DetailsItem'
import { TxStatusCardProgress } from 'features/openVault/TxStatusCard'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Flex, Grid, Link, Spinner, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

export function ManageVaultConfirmation({
  stage,
  balanceInfo: { collateralBalance },
  depositAmount,
  generateAmount,
  paybackAmount,
  withdrawAmount,
  vault: { token },
  afterCollateralizationRatio,
  afterLiquidationPrice,
  etherscan,
  manageTxHash,
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
      <Card backgroundColor="secondaryAlt" sx={{ border: 'none' }}>
        <Grid columns="1fr 1fr">
          <DetailsItem header={t('system.in-your-wallet')} value={`${walletBalance} ${token}`} />

          {depositAmount?.gt(zero) && (
            <DetailsItem header={t('moving-into-vault')} value={`${depositCollateral} ${token}`} />
          )}
          {withdrawAmount?.gt(zero) && (
            <DetailsItem
              header={t('moving-out-vault')}
              value={`${withdrawingCollateral} ${token}`}
            />
          )}
          <DetailsItem header={t('remaining-in-wallet')} value={`${remainingInWallet} ${token}`} />
          {generateAmount?.gt(zero) && (
            <DetailsItem header={t('dai-being-generated')} value={`${daiToBeGenerated} DAI`} />
          )}
          {paybackAmount?.gt(zero) && (
            <DetailsItem header={t('dai-paying-back-label')} value={`${daiPayingBack} DAI`} />
          )}
          <DetailsItem
            header={t('system.collateral-ratio')}
            value={<Text sx={{ color: vaultRiskColor }}>{afterCollRatio}</Text>}
          />
          <DetailsItem header={t('system.liquidation-price')} value={`$${afterLiqPrice}`} />
        </Grid>
      </Card>
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
