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
import { PreparedAaveReserveData } from 'features/aave/helpers/aavePrepareReserveData'
import { formatAmount, formatDecimalAsPercent } from 'helpers/formatters/format'
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

const getLTVRatioColor = (ratio: BigNumber) => {
  const critical = new BigNumber(5)
  const warning = new BigNumber(20)

  switch (true) {
    case ratio.isLessThanOrEqualTo(critical):
      return 'critical10'
    case ratio.isLessThanOrEqualTo(warning):
      return 'warning10'
    default:
      return 'success10'
  }
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
    .div(debt.times(debtTokenPrice))

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
            // works as long as debt token is USDC
            value={`${formatAmount(currentPositionThings.liquidationPrice, 'USD')} USDC`}
            change={
              nextPositionThings && {
                variant: nextPositionThings.liquidationPrice.gte(
                  currentPositionThings.liquidationPrice,
                )
                  ? 'positive'
                  : 'negative',
                // works as long as debt token is USDC
                value: `$${formatAmount(nextPositionThings.liquidationPrice, 'USD')} ${t('after')}`,
              }
            }
            footnote={`${t('manage-earn-vault.below-current-price', {
              percentage: formatDecimalAsPercent(
                // works as long as collateral is eth (debt token price is in eth from oracle)
                currentPositionThings.liquidationPrice
                  .minus(debtTokenPrice)
                  .dividedBy(debtTokenPrice)
                  .absoluteValue(),
              ),
            })}`}
          />
          <DetailsSectionContentCard
            title={t('system.loan-to-value')}
            value={formatDecimalAsPercent(currentPosition.riskRatio.loanToValue)}
            change={
              nextPosition && {
                variant: nextPosition.riskRatio.loanToValue.lt(
                  currentPosition.riskRatio.loanToValue,
                )
                  ? 'negative'
                  : 'positive',
                value: `${formatDecimalAsPercent(nextPosition.riskRatio.loanToValue)} ${t(
                  'after',
                )}`,
              }
            }
            footnote={`${t('manage-earn-vault.liquidation-threshold', {
              percentage: formatDecimalAsPercent(currentPosition.category.liquidationThreshold),
            })}`}
            customBackground={
              !nextPosition?.riskRatio
                ? getLTVRatioColor(
                    currentPosition.category.liquidationThreshold
                      .minus(currentPosition.riskRatio.loanToValue)
                      .times(100),
                  )
                : 'transparent'
            }
          />
          <DetailsSectionContentCard
            title={t('system.net-borrow-cost')}
            value={formatDecimalAsPercent(currentPositionThings.netBorrowCostPercentage)}
            change={
              nextPositionThings && {
                variant: nextPositionThings.netBorrowCostPercentage.lt(
                  currentPositionThings.netBorrowCostPercentage,
                )
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
            value={`${formatAmount(currentPositionThings.netValue, 'USD')} USDC`}
            change={
              nextPositionThings && {
                variant: nextPositionThings.netValue.gt(currentPositionThings.netValue)
                  ? 'positive'
                  : 'negative',
                value: `${formatAmount(nextPositionThings.netValue, 'USD')} ${t('after')}`,
              }
            }
          />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <DetailsSectionFooterItem
            title={t('system.position-debt')}
            value={`${formatAmount(currentPositionThings.debt, 'USD')} USDC`}
            change={
              nextPositionThings && {
                variant: nextPositionThings.debt.gt(currentPositionThings.debt)
                  ? 'positive'
                  : 'negative',
                value: `${formatAmount(nextPositionThings.debt, 'USD')} USDC ${t('after')}`,
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
            value={`${currentPosition.riskRatio.multiple.toFormat(1, BigNumber.ROUND_DOWN)}x`}
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
            value={`${formatAmount(currentPositionThings.buyingPower, 'USD')} USDC`}
            change={
              nextPositionThings && {
                variant: nextPositionThings.buyingPower.gt(currentPositionThings.buyingPower)
                  ? 'positive'
                  : 'negative',
                value: `${formatAmount(nextPositionThings.buyingPower, 'USD')} USDC ${t('after')}`,
              }
            }
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
