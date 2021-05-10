import { Details } from 'components/forms/Details'
import { TxStatusCardProgress, TxStatusCardSuccess } from 'features/openVault/TxStatusCard'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Grid, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

export function ManageVaultConfirmation(props: ManageVaultState) {
  const [snapshot, setSnapshot] = useState<ManageVaultState | undefined>(undefined)
  useEffect(() => {
    if (props.stage === 'manageWaitingForApproval') {
      setSnapshot(props)
    }
  }, [props.stage])

  const state = snapshot && props.stage === 'manageSuccess' ? snapshot : props

  const {
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
  } = state

  const { t } = useTranslation()
  const walletBalance = formatCryptoBalance(collateralBalance)
  const depositCollateral = formatCryptoBalance(depositAmount || zero)
  const withdrawingCollateral = formatCryptoBalance(withdrawAmount || zero)
  const remainingInWallet = formatCryptoBalance(
    depositAmount
      ? collateralBalance.minus(depositAmount)
      : withdrawAmount
      ? collateralBalance.plus(withdrawAmount)
      : collateralBalance,
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
        <Details.Item label={t('system.in-your-wallet')} value={`${walletBalance} ${token}`} />

        {depositAmount?.gt(zero) && (
          <Details.Item label={t('moving-into-vault')} value={`${depositCollateral} ${token}`} />
        )}
        {withdrawAmount?.gt(zero) && (
          <Details.Item label={t('moving-out-vault')} value={`${withdrawingCollateral} ${token}`} />
        )}
        <Details.Item label={t('remaining-in-wallet')} value={`${remainingInWallet} ${token}`} />
        {generateAmount?.gt(zero) && (
          <Details.Item label={t('dai-being-generated')} value={`${daiToBeGenerated} DAI`} />
        )}
        {paybackAmount?.gt(zero) && (
          <Details.Item label={t('dai-paying-back-label')} value={`${daiPayingBack} DAI`} />
        )}
        <Details.Item
          label={t('system.collateral-ratio')}
          value={<Text sx={{ color: vaultRiskColor }}>{afterCollRatio}</Text>}
        />
        <Details.Item label={t('system.liquidation-price')} value={`$${afterLiqPrice}`} />
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
      <TxStatusCardSuccess
        text={t('vault-changed')}
        etherscan={etherscan!}
        txHash={manageTxHash!}
      />
    )
  }
  return null
}
