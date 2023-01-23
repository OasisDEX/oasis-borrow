import { IPosition } from '@oasisdex/oasis-actions'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { AaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCard,
  DetailsSectionContentCardWrapper,
} from 'components/DetailsSectionContentCard'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import { ContentCardLtv } from 'components/vault/detailsSection/ContentCardLtv'
import { PreparedAaveReserveData } from 'features/aave/helpers/aavePrepareReserveData'
import { displayMultiple } from 'helpers/display-multiple'
import { formatAmount, formatDecimalAsPercent, formatPrecision } from 'helpers/formatters/format'
import { NaNIsZero } from 'helpers/nanIsZero'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

type AaveMultiplyPositionDataProps = {
  currentPosition: IPosition
  nextPosition?: IPosition
  collateralTokenPrice: BigNumber
  debtTokenPrice: BigNumber
  collateralTokenReserveData: PreparedAaveReserveData
  debtTokenReserveData: PreparedAaveReserveData
  debtTokenReserveConfigurationData: AaveReserveConfigurationData
}

function calcViewValuesForPosition(
  position: IPosition,
  collateralTokenPrice: BigNumber,
  debtTokenPrice: BigNumber,
  collateralLiquidityRate: BigNumber,
  debtVariableBorrowRate: BigNumber,
) {
  const collateral = amountFromWei(position.collateral.amount, position.collateral.precision)
  const debt = amountFromWei(position.debt.amount, position.debt.precision)

  // collateral * usdprice * maxLTV - debt * usdprice
  const buyingPower = collateral
    .times(collateralTokenPrice)
    .times(position.category.maxLoanToValue)
    .minus(debt.times(debtTokenPrice))

  // (collateral_amount * collateral_token_oracle_price - debt_token_amount * debt_token_oracle_price) / USDC_oracle_price
  const netValue = collateral.times(collateralTokenPrice).minus(debt.times(debtTokenPrice))

  const totalExposure = collateral

  const liquidationPrice = NaNIsZero(
    debt.div(collateral.times(position.category.liquidationThreshold)),
  )

  const costOfBorrowingDebt = debtVariableBorrowRate.times(debt).times(debtTokenPrice)
  const profitFromProvidingCollateral = collateralLiquidityRate
    .times(collateral)
    .times(collateralTokenPrice)
  const netBorrowCostPercentage = costOfBorrowingDebt
    .minus(profitFromProvidingCollateral)
    .div(netValue)

  return {
    collateral,
    debt,
    buyingPower,
    netValue,
    totalExposure,
    liquidationPrice,
    netBorrowCostPercentage,
  }
}

export function AaveMultiplyPositionData({
  currentPosition,
  nextPosition,
  collateralTokenPrice,
  debtTokenPrice,
  collateralTokenReserveData,
  debtTokenReserveData,
  debtTokenReserveConfigurationData,
}: AaveMultiplyPositionDataProps) {
  const { t } = useTranslation()

  const currentPositionThings = calcViewValuesForPosition(
    currentPosition,
    collateralTokenPrice,
    debtTokenPrice,
    collateralTokenReserveData.liquidityRate,
    debtTokenReserveData.variableBorrowRate,
  )

  const nextPositionThings =
    nextPosition &&
    calcViewValuesForPosition(
      nextPosition,
      collateralTokenPrice,
      debtTokenPrice,
      collateralTokenReserveData.liquidityRate,
      debtTokenReserveData.variableBorrowRate,
    )

  const belowCurrentPricePercentage = formatDecimalAsPercent(
    currentPositionThings.liquidationPrice
      .minus(collateralTokenPrice)
      .dividedBy(collateralTokenPrice)
      .absoluteValue(),
  )

  const netBorrowCostInUSDC = currentPositionThings.debt
    .times(debtTokenPrice)
    .times(NaNIsZero(currentPositionThings.netBorrowCostPercentage))

  return (
    <DetailsSection
      title={t('system.overview')}
      content={
        <DetailsSectionContentCardWrapper>
          <DetailsSectionContentCard
            title={t('system.liquidation-price')}
            value={`${formatPrecision(currentPositionThings.liquidationPrice, 2)} ${
              currentPosition.debt.symbol
            }`}
            change={
              nextPositionThings && {
                variant: nextPositionThings.liquidationPrice.gte(
                  currentPositionThings.liquidationPrice,
                )
                  ? 'positive'
                  : 'negative',
                value: `$${formatPrecision(NaNIsZero(nextPositionThings.liquidationPrice), 2)} ${t(
                  'after',
                )}`,
              }
            }
            footnote={
              !currentPositionThings.liquidationPrice.isNaN() &&
              !currentPositionThings.liquidationPrice.eq(zero)
                ? `${t('manage-earn-vault.below-current-price', {
                    percentage: belowCurrentPricePercentage,
                  })}`
                : undefined
            }
            modal={
              <Grid gap={2}>
                <Heading variant="header4">
                  {t('aave-position-modal.liquidation-price.first-header')}
                </Heading>
                <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
                  {t('aave-position-modal.liquidation-price.first-description-line')}
                </Text>
                <Card as="p" variant="vaultDetailsCardModal">
                  {`${formatPrecision(NaNIsZero(currentPositionThings.liquidationPrice), 2)} ${
                    currentPosition.debt.symbol
                  }`}
                </Card>
                {!currentPositionThings.liquidationPrice.isNaN() && (
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
                  {formatDecimalAsPercent(debtTokenReserveConfigurationData.liquidationBonus)}
                </Card>
              </Grid>
            }
          />
          <ContentCardLtv
            loanToValue={currentPosition.riskRatio.loanToValue}
            liquidationThreshold={currentPosition.category.liquidationThreshold}
            afterLoanToValue={nextPosition?.riskRatio.loanToValue}
            modal={
              <Grid gap={2}>
                <Heading variant="header4">{t('aave-position-modal.ltv.first-header')}</Heading>
                <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
                  {t('aave-position-modal.ltv.first-description-line')}
                </Text>
                <Card as="p" variant="vaultDetailsCardModal">
                  {formatDecimalAsPercent(currentPosition.riskRatio.loanToValue)}
                </Card>
                <Heading variant="header4">{t('aave-position-modal.ltv.second-header')}</Heading>
                <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
                  {t('aave-position-modal.ltv.second-description-line')}
                </Text>
                <Card as="p" variant="vaultDetailsCardModal">
                  {formatDecimalAsPercent(currentPosition.category.maxLoanToValue)}
                </Card>
                <Heading variant="header4">{t('aave-position-modal.ltv.third-header')}</Heading>
                <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
                  {t('aave-position-modal.ltv.third-description-line')}
                </Text>
                <Card as="p" variant="vaultDetailsCardModal">
                  {formatDecimalAsPercent(currentPosition.category.liquidationThreshold)}
                </Card>
              </Grid>
            }
          />
          <DetailsSectionContentCard
            title={t('system.net-borrow-cost')}
            value={formatDecimalAsPercent(NaNIsZero(currentPositionThings.netBorrowCostPercentage))}
            change={
              nextPositionThings && {
                variant: nextPositionThings.netBorrowCostPercentage.lte(zero)
                  ? 'positive'
                  : 'negative',
                value: `${formatDecimalAsPercent(
                  NaNIsZero(nextPositionThings.netBorrowCostPercentage),
                )} ${t('after')}`,
              }
            }
            modal={
              <Grid gap={2}>
                <Heading variant="header4">
                  {t('aave-position-modal.net-borrow-cost.first-header')}
                </Heading>
                <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
                  {t('aave-position-modal.net-borrow-cost.first-description-line')}
                  <Text as="span" variant="boldParagraph3" sx={{ mt: 1 }}>
                    {t('aave-position-modal.net-borrow-cost.positive-negative-line')}
                  </Text>
                </Text>
                <Card as="p" variant="vaultDetailsCardModal">
                  {formatDecimalAsPercent(NaNIsZero(currentPositionThings.netBorrowCostPercentage))}
                </Card>
                <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
                  {t('aave-position-modal.net-borrow-cost.second-description-line')}
                </Text>
                <Heading variant="header4">
                  {t('aave-position-modal.net-borrow-cost.second-header', {
                    debtToken: currentPosition.debt.symbol,
                  })}
                </Heading>
                <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
                  {t('aave-position-modal.net-borrow-cost.third-description-line', {
                    debtToken: currentPosition.debt.symbol,
                  })}
                  <Text as="span" variant="boldParagraph3" sx={{ mt: 1 }}>
                    {t('aave-position-modal.net-borrow-cost.positive-negative-line')}
                  </Text>
                </Text>
                <Card as="p" variant="vaultDetailsCardModal">
                  {`${formatPrecision(netBorrowCostInUSDC, 2)} ${currentPosition.debt.symbol}`}
                </Card>
              </Grid>
            }
          />
          <DetailsSectionContentCard
            title={t('system.net-value')}
            value={`${formatPrecision(currentPositionThings.netValue, 2)} ${
              currentPosition.debt.symbol
            }`}
            change={
              nextPositionThings && {
                variant: nextPositionThings.netValue.gt(currentPositionThings.netValue)
                  ? 'positive'
                  : 'negative',
                value: `${formatPrecision(nextPositionThings.netValue, 2)} ${t('after')}`,
              }
            }
          />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <DetailsSectionFooterItem
            title={t('system.position-debt')}
            value={`${formatPrecision(currentPositionThings.debt, 4)} ${
              currentPosition.debt.symbol
            }`}
            change={
              nextPositionThings && {
                variant: nextPositionThings.debt.gt(currentPositionThings.debt)
                  ? 'positive'
                  : 'negative',
                value: `${formatPrecision(nextPositionThings.debt, 4)} ${
                  nextPosition.debt.symbol
                } ${t('after')}`,
              }
            }
          />
          <DetailsSectionFooterItem
            title={t('system.total-exposure', { token: currentPosition.collateral.symbol })}
            value={`${formatAmount(currentPositionThings.totalExposure, 'ETH')} ETH`}
            change={
              nextPositionThings && {
                variant: nextPositionThings.totalExposure.gt(currentPositionThings.totalExposure)
                  ? 'positive'
                  : 'negative',
                value: `${formatAmount(nextPositionThings.totalExposure, 'ETH')} ETH ${t('after')}`,
              }
            }
          />
          <DetailsSectionFooterItem
            title={t('system.multiple')}
            value={displayMultiple(currentPosition.riskRatio.multiple)}
            change={
              nextPosition && {
                variant: nextPosition.riskRatio.multiple.gt(currentPosition.riskRatio.multiple)
                  ? 'positive'
                  : 'negative',
                value: `${nextPosition.riskRatio.multiple.toFormat(1, BigNumber.ROUND_DOWN)}x ${t(
                  'after',
                )}`,
              }
            }
          />
          <DetailsSectionFooterItem
            title={t('system.buying-power')}
            value={`${formatPrecision(currentPositionThings.buyingPower, 2)} ${
              currentPosition.debt.symbol
            }`}
            change={
              nextPositionThings && {
                variant: nextPositionThings.buyingPower.gt(currentPositionThings.buyingPower)
                  ? 'positive'
                  : 'negative',
                value: `${formatPrecision(nextPositionThings.buyingPower, 2)} ${
                  nextPosition.debt.symbol
                } ${t('after')}`,
              }
            }
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
