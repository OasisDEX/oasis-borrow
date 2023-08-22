import { IPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { calculateViewValuesForPosition } from 'features/aave/services'
import { StrategyType } from 'features/aave/types'
import { formatDecimalAsPercent, formatPrecision } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { ReserveConfigurationData, ReserveData } from 'lendingProtocols/aaveCommon'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

export function LiquidationPriceCard(props: {
  position: IPosition
  strategyType: StrategyType
  collateralTokenPrice: BigNumber
  debtTokenPrice: BigNumber
  currentPositionThings: ReturnType<typeof calculateViewValuesForPosition>
  nextPositionThings: ReturnType<typeof calculateViewValuesForPosition> | undefined
  collateralTokenReserveData: ReserveData
  debtTokenReserveData: ReserveData
  debtTokenReserveConfigurationData: ReserveConfigurationData
}) {
  const belowCurrentPricePercentage = formatDecimalAsPercent(
    props.currentPositionThings.liquidationPriceInDebt
      .minus(props.collateralTokenPrice)
      .dividedBy(props.collateralTokenPrice)
      .absoluteValue(),
  )

  const liquidationPriceSymbol =
    props.strategyType === StrategyType.Long
      ? props.position.debt.symbol
      : props.position.collateral.symbol
  const currentLiquidationPrice =
    props.strategyType === StrategyType.Long
      ? props.currentPositionThings.liquidationPriceInDebt
      : props.currentPositionThings.liquidationPriceInCollateral
  const nextLiquidationPrice = props.nextPositionThings
    ? props.strategyType === StrategyType.Long
      ? props.nextPositionThings.liquidationPriceInDebt
      : props.nextPositionThings.liquidationPriceInCollateral
    : undefined

  const { t } = useTranslation()
  return (
    <DetailsSectionContentCard
      title={t('system.liquidation-price')}
      value={`${formatPrecision(currentLiquidationPrice, 2)} ${liquidationPriceSymbol}`}
      change={
        nextLiquidationPrice && {
          variant: nextLiquidationPrice.gte(currentLiquidationPrice) ? 'positive' : 'negative',
          value: `${formatPrecision(nextLiquidationPrice, 2)} ${t('after')}`,
        }
      }
      footnote={
        !currentLiquidationPrice.eq(zero)
          ? t('manage-earn-vault.below-current-price', { percentage: belowCurrentPricePercentage })
          : undefined
      }
      modal={
        <Grid gap={2}>
          <Heading variant="header4">
            {t('aave-position-modal.liquidation-price.first-header')}
          </Heading>
          <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
            {props.strategyType === StrategyType.Long
              ? t('aave-position-modal.liquidation-price.first-description-line-long')
              : t('aave-position-modal.liquidation-price.first-description-line-short')}
          </Text>
          <Card as="p" variant="vaultDetailsCardModal">
            {`${formatPrecision(currentLiquidationPrice, 2)} ${liquidationPriceSymbol}`}
          </Card>
          {!props.currentPositionThings.liquidationPriceInDebt.isNaN() && (
            <Text as="p" variant="paragraph3" sx={{ mt: 1 }}>
              {t('aave-position-modal.liquidation-price.second-description-line', {
                percent: belowCurrentPricePercentage,
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
            {formatDecimalAsPercent(props.debtTokenReserveConfigurationData.liquidationBonus)}
          </Card>
        </Grid>
      }
    />
  )
}
