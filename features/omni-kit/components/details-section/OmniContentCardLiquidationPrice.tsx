import type BigNumber from 'bignumber.js'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatDecimalAsPercent, formatPrecision } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

export const OmniContentCardLiquidationPrice = ({
  liquidationPriceInDebt,
  afterLiquidationPriceInDebt,
  liquidationPriceInCollateral,
  afterLiquidationPriceInCollateral,
  collateralPrice,
  liquidationPenalty,
  quotePrice,
  quoteToken,
  isShort,
  collateralToken,
}: {
  liquidationPriceInDebt: BigNumber
  afterLiquidationPriceInDebt?: BigNumber
  liquidationPriceInCollateral: BigNumber
  afterLiquidationPriceInCollateral?: BigNumber
  collateralPrice: BigNumber
  quotePrice: BigNumber
  quoteToken: string
  collateralToken: string
  isShort: boolean
  liquidationPenalty: BigNumber
}) => {
  const { t } = useTranslation()

  const belowCurrentPricePercentage = formatDecimalAsPercent(
    liquidationPriceInDebt
      .times(quotePrice)
      .minus(collateralPrice)
      .dividedBy(collateralPrice)
      .absoluteValue(),
  )

  const aboveCurrentPricePercentage = formatDecimalAsPercent(
    liquidationPriceInCollateral
      .times(collateralPrice)
      .minus(quotePrice)
      .dividedBy(quotePrice)
      .absoluteValue(),
  )

  const liquidationPriceSymbol = !isShort ? quoteToken : collateralToken
  const currentLiquidationPrice = !isShort ? liquidationPriceInDebt : liquidationPriceInCollateral
  const nextLiquidationPrice =
    afterLiquidationPriceInDebt || afterLiquidationPriceInCollateral
      ? !isShort
        ? afterLiquidationPriceInDebt
        : afterLiquidationPriceInCollateral
      : undefined

  const footnoteChange = !isShort
    ? t('manage-earn-vault.below-current-price', { percentage: belowCurrentPricePercentage })
    : t('manage-earn-vault.above-current-price', { percentage: aboveCurrentPricePercentage })

  return (
    // TODO remove aave from translations keys as this card may be common for different protocols
    <DetailsSectionContentCard
      title={t('system.liquidation-price')}
      value={`${formatPrecision(currentLiquidationPrice, 2)} ${liquidationPriceSymbol}`}
      change={
        nextLiquidationPrice && {
          variant: nextLiquidationPrice.gte(currentLiquidationPrice) ? 'positive' : 'negative',
          value: `${formatPrecision(nextLiquidationPrice, 2)} ${t('after')}`,
        }
      }
      footnote={!currentLiquidationPrice.eq(zero) ? footnoteChange : undefined}
      modal={
        <Grid gap={2}>
          <Heading variant="header4">
            {t('aave-position-modal.liquidation-price.first-header')}
          </Heading>
          <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
            {!isShort
              ? t('aave-position-modal.liquidation-price.first-description-line-long')
              : t('aave-position-modal.liquidation-price.first-description-line-short')}
          </Text>
          <Card as="p" variant="vaultDetailsCardModal">
            {`${formatPrecision(currentLiquidationPrice, 2)} ${liquidationPriceSymbol}`}
          </Card>
          {!liquidationPriceInDebt.isNaN() && (
            <Text as="p" variant="paragraph3" sx={{ mt: 1 }}>
              {!isShort
                ? t('aave-position-modal.liquidation-price.second-description-line-long', {
                    percent: belowCurrentPricePercentage,
                  })
                : t('aave-position-modal.liquidation-price.second-description-line-short', {
                    percent: aboveCurrentPricePercentage,
                  })}
            </Text>
          )}
          <Heading variant="header4">
            {t('aave-position-modal.liquidation-price.second-header')}
          </Heading>
          <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
            {t('aave-position-modal.liquidation-price.third-description-line')}
          </Text>
          <Card as="p" variant="vaultDetailsCardModal">
            {formatDecimalAsPercent(liquidationPenalty)}
          </Card>
        </Grid>
      }
    />
  )
}
