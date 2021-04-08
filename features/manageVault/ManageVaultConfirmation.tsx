import { Icon } from '@makerdao/dai-ui-icons'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import {  Card, Flex, Grid, Link, Spinner, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

export function ManageVaultConfirmation({
  stage,
  collateralBalance,
  depositAmount,
  generateAmount,
  paybackAmount,
  withdrawAmount,
  token,
  afterCollateralizationRatio,
  afterLiquidationPrice,
  progress,
  etherscan,
  manageTxHash,
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

  return (
    <Grid>
      <Card backgroundColor="Success">
        <Grid columns="1fr 1fr">
          <Text sx={{ fontSize: 1 }}>{t('system.in-your-wallet')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>
            {walletBalance} {token}
          </Text>

          <Text sx={{ fontSize: 1 }}>{t('moving-into-vault')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>
            {depositCollateral} {token}
          </Text>

          <Text sx={{ fontSize: 1 }}>{t('moving-out-vault')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>
            {withdrawingCollateral} {token}
          </Text>

          <Text sx={{ fontSize: 1 }}>{t('remaining-in-wallet')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>
            {remainingInWallet} {token}
          </Text>

          <Text sx={{ fontSize: 1 }}>{t('dai-being-generated')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>{daiToBeGenerated} DAI</Text>

          <Text sx={{ fontSize: 1 }}>{t('dai-paying-back')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>{daiPayingBack} DAI</Text>

          <Text sx={{ fontSize: 1 }}>{t('system.collateral-ratio')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>{afterCollRatio}</Text>

          <Text sx={{ fontSize: 1 }}>{t('system.liquidation-price')}</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>${afterLiqPrice}</Text>
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
