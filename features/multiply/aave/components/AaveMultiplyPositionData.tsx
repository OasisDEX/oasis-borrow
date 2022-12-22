import { IPosition } from '@oasisdex/oasis-actions'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
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

type AaveMultiplyPositionDataProps = {
  currentPosition: IPosition
  nextPosition?: IPosition
  collateralTokenPrice: BigNumber
  debtTokenPrice: BigNumber
  collateralTokenReserveData: PreparedAaveReserveData
  debtTokenReserveData: PreparedAaveReserveData
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

  const liquidationPrice = debt.div(collateral.times(position.category.liquidationThreshold))

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

  return (
    <DetailsSection
      title={t('system.overview')}
      content={
        <DetailsSectionContentCardWrapper>
          <DetailsSectionContentCard
            title={t('system.liquidation-price')}
            value={`${formatPrecision(NaNIsZero(currentPositionThings.liquidationPrice), 2)} ${
              currentPosition.debt.symbol
            }`}
            change={
              nextPositionThings && {
                variant: nextPositionThings.liquidationPrice.gte(
                  currentPositionThings.liquidationPrice,
                )
                  ? 'positive'
                  : 'negative',
                value: `$${formatPrecision(nextPositionThings.liquidationPrice, 2)} ${t('after')}`,
              }
            }
            footnote={`${t('manage-earn-vault.below-current-price', {
              percentage: formatDecimalAsPercent(
                currentPositionThings.liquidationPrice
                  .minus(collateralTokenPrice)
                  .dividedBy(collateralTokenPrice)
                  .absoluteValue(),
              ),
            })}`}
          />
          <ContentCardLtv
            loanToValue={currentPosition.riskRatio.loanToValue}
            liquidationThreshold={currentPosition.category.liquidationThreshold}
            afterLoanToValue={nextPosition?.riskRatio.loanToValue}
          />
          <DetailsSectionContentCard
            title={t('system.net-borrow-cost')}
            value={formatDecimalAsPercent(NaNIsZero(currentPositionThings.netBorrowCostPercentage))}
            change={
              nextPositionThings && {
                variant: nextPositionThings.netBorrowCostPercentage.lte(zero)
                  ? 'positive'
                  : 'negative',
                value: `${formatDecimalAsPercent(nextPositionThings.netBorrowCostPercentage)} ${t(
                  'after',
                )}`,
              }
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
