import { normalizeValue } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { NaNIsZero } from 'helpers/nanIsZero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

export const AaveLikeCostToBorrowContentCardModal = ({
  collateralAmount,
  collateralPrice,
  debtAmount,
  quotePrice,
  quoteToken,
  debtVariableBorrowRate,
  collateralLiquidityRate,
  netValue,
}: {
  collateralAmount: BigNumber
  collateralPrice: BigNumber
  debtAmount: BigNumber
  quotePrice: BigNumber
  quoteToken: string
  debtVariableBorrowRate: BigNumber
  collateralLiquidityRate: BigNumber
  netValue: BigNumber
}) => {
  const { t } = useTranslation()

  const costOfBorrowingDebt = debtVariableBorrowRate.times(debtAmount).times(quotePrice)
  const profitFromProvidingCollateral = collateralLiquidityRate
    .times(collateralAmount)
    .times(collateralPrice)
  const netBorrowCostPercentage = normalizeValue(
    costOfBorrowingDebt.minus(profitFromProvidingCollateral).div(netValue),
  )

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
      <Text as="p" variant="boldParagraph3" sx={{ mb: 1 }}>
        {t('aave-position-modal.net-borrow-cost.borrow-apy', {
          rate: formatDecimalAsPercent(debtVariableBorrowRate),
        })}
      </Text>
      <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
        <Text as="span" variant="boldParagraph3" sx={{ mb: 1 }}>
          {t('aave-position-modal.net-borrow-cost.supply-apy', {
            rate: formatDecimalAsPercent(collateralLiquidityRate),
          })}
        </Text>
        <Text as="span" variant="paragraph3" sx={{ mb: 1 }}>
          {t('aave-position-modal.net-borrow-cost.supply-apy-note')}
        </Text>
      </Text>
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
