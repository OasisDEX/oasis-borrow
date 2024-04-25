import { normalizeValue } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { isYieldLoopToken } from 'features/omni-kit/helpers'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { NaNIsZero } from 'helpers/nanIsZero'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Flex, Grid, Heading, Text } from 'theme-ui'

export const AaveLikeCostToBorrowContentCardModal = ({
  collateralAmount,
  collateralPrice,
  collateralToken,
  debtAmount,
  quotePrice,
  quoteToken,
  debtVariableBorrowRate,
  collateralLiquidityRate,
  netValue,
  apy,
}: {
  collateralAmount: BigNumber
  collateralPrice: BigNumber
  collateralToken: string
  debtAmount: BigNumber
  quotePrice: BigNumber
  quoteToken: string
  debtVariableBorrowRate: BigNumber
  collateralLiquidityRate: BigNumber
  netValue: BigNumber
  apy?: BigNumber
}) => {
  const { t } = useTranslation()

  const costOfBorrowingDebt = debtVariableBorrowRate.times(debtAmount).times(quotePrice)
  const profitFromProvidingCollateral = collateralLiquidityRate
    .times(collateralAmount)
    .times(collateralPrice)
  const netBorrowCostPercentage = normalizeValue(
    costOfBorrowingDebt.minus(profitFromProvidingCollateral).div(netValue),
  ).minus(apy || zero)

  const costToBorrow = debtAmount.times(NaNIsZero(debtVariableBorrowRate))

  return (
    <Grid gap={2}>
      <Heading variant="header4">{t('aave-position-modal.net-borrow-cost.first-header')}</Heading>
      <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
        {t('aave-position-modal.net-borrow-cost.first-description-line')}
        <Text as="span" variant="boldParagraph3" sx={{ mt: 1 }}>
          {t('aave-position-modal.net-borrow-cost.positive-negative-line')}
        </Text>
      </Text>
      <Card as="p" variant="vaultDetailsCardModal">
        {formatDecimalAsPercent(NaNIsZero(netBorrowCostPercentage))}
      </Card>
      <Flex sx={{ justifyContent: 'space-around' }}>
        <Card variant="vaultDetailsCardModalDetail">
          {t('aave-position-modal.net-borrow-cost.borrow-apy', {
            rate: formatDecimalAsPercent(
              debtVariableBorrowRate.plus(isYieldLoopToken(quoteToken) ? apy || zero : zero),
            ),
          })}
        </Card>
        <Card variant="vaultDetailsCardModalDetail" sx={{ ml: 2 }}>
          {t('aave-position-modal.net-borrow-cost.supply-apy', {
            rate: formatDecimalAsPercent(
              collateralLiquidityRate.plus(isYieldLoopToken(collateralToken) ? apy || zero : zero),
            ),
          })}
        </Card>
      </Flex>
      <Heading variant="header4">
        {t('aave-position-modal.net-borrow-cost.second-header', {
          debtToken: quoteToken,
        })}
      </Heading>
      <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
        {t('aave-position-modal.net-borrow-cost.third-description-line')}
        <Text as="span" variant="boldParagraph3" sx={{ mt: 1 }}>
          {t('aave-position-modal.net-borrow-cost.positive-negative-line')}
        </Text>
      </Text>
      <Card as="p" variant="vaultDetailsCardModal">
        {`${formatCryptoBalance(costToBorrow)} ${quoteToken}`}
      </Card>
    </Grid>
  )
}
