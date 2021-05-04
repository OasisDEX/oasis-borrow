import { Icon } from '@makerdao/dai-ui-icons'
import { DetailsItem } from 'components/forms/DetailsItem'
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

      {stage === 'manageInProgress' && (
        <Card sx={{ backgroundColor: 'warning', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Spinner size={25} color="onWarning" />
            <Grid pl={2} gap={1}>
              <Text color="onWarning" sx={{ fontSize: 1 }}>
                {t('changing-vault')}
              </Text>
              <Link
                href={`${etherscan}/tx/${manageTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onWarning" sx={{ fontSize: 1 }}>
                  {t('view-on-etherscan')} -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}

      {stage === 'manageSuccess' && (
        <Card sx={{ backgroundColor: 'success', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Icon name="checkmark" size={25} color="onSuccess" />
            <Grid pl={2} gap={1}>
              <Text color="onSuccess" sx={{ fontSize: 1 }}>
                {t('vault-changed')}
              </Text>
              <Link
                href={`${etherscan}/tx/${manageTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onSuccess" sx={{ fontSize: 1 }}>
                  {t('view-on-etherscan')} -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
    </Grid>
  )
}
