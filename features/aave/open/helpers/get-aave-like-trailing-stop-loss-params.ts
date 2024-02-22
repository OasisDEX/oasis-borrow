import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import type { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { StrategyType } from 'features/aave/types'
import {
  getCollateralDuringLiquidation,
  getSliderPercentageFill,
} from 'features/automation/protection/stopLoss/helpers'
import { one, zero } from 'helpers/zero'
import { memoize } from 'lodash'
import { useCallback, useMemo } from 'react'

const getSliderStep = (tokenPrice: BigNumber) => {
  if (tokenPrice.isGreaterThan(100000)) {
    return 1000
  }
  if (tokenPrice.isGreaterThan(10000)) {
    return 100
  }
  if (tokenPrice.isGreaterThan(1000)) {
    return 10
  }
  if (tokenPrice.isGreaterThan(100)) {
    return 1
  }
  if (tokenPrice.isGreaterThan(1)) {
    return 0.1
  }
  return 0.001
}

export const getAaveLikeTrailingStopLossParams = {
  manage: memoize(
    ({
      state,
      trailingStopLossLambdaData,
      trailingStopLossToken,
    }: Pick<ManageAaveStateProps, 'state'> & {
      trailingStopLossLambdaData: ReturnType<typeof mapTrailingStopLossFromLambda>
      trailingStopLossToken: 'debt' | 'collateral'
    }) => {
      const isCloseToCollateral = trailingStopLossToken === 'collateral'
      const {
        strategyInfo,
        currentPosition,
        trailingDistance: contextTrailingDistance,
        strategyConfig,
      } = state.context
      const debt = amountFromWei(
        currentPosition?.debt.amount || zero,
        currentPosition?.debt.precision,
      )
      const lockedCollateral = amountFromWei(
        currentPosition?.collateral.amount || zero,
        currentPosition?.collateral.precision,
      )

      const positionRatio = currentPosition?.riskRatio.loanToValue || zero
      const liquidationRatio = currentPosition?.category.liquidationThreshold || zero
      const liquidationPrice = debt.div(lockedCollateral.times(liquidationRatio)) || zero
      // some of the numbers might be counter intuitive
      // firstly im getting a step for the slider (higher price -> higher step)
      // then im setting a minimum (highest trailing distance) to be a slider step value
      // as this is the lowest value that makes sense
      const collateralTokenPrice = strategyInfo?.oracleAssetPrice.collateral || one
      const debtTokenPrice = strategyInfo?.oracleAssetPrice.debt || one
      const priceRatio = useMemo(
        () =>
          strategyConfig.strategyType === StrategyType.Short
            ? debtTokenPrice.div(collateralTokenPrice)
            : collateralTokenPrice.div(debtTokenPrice),
        [collateralTokenPrice, debtTokenPrice, strategyConfig.strategyType],
      )
      const sliderStep = getSliderStep(collateralTokenPrice)
      const sliderMin = new BigNumber(
        (liquidationPrice || one).div(sliderStep).toFixed(0, BigNumber.ROUND_DOWN),
      ).times(sliderStep)
      // then the maximum value is the price divided by the step, floored and then multiplied by the step
      // so in the end we get a rounded numbers
      const sliderMax = new BigNumber(
        priceRatio.div(sliderStep).toFixed(0, BigNumber.ROUND_DOWN),
      ).times(sliderStep)
      // then the trailing distance - if it's lower (by default) than the slider min, I'm setting it to the slider min
      // the actual value of the trailing distance used in the TX is called "trailingDistanceValue"
      const trailingDistance = contextTrailingDistance
        ? contextTrailingDistance.lt(sliderMin)
          ? sliderMin
          : contextTrailingDistance
        : sliderMax

      const sliderPercentageFill = getSliderPercentageFill({
        min: sliderMin,
        max: sliderMax.minus(sliderStep),
        value: trailingDistance,
      })
      const getTrailingDistanceValue = useCallback(
        (td: BigNumber) => sliderMax.minus(td),
        [sliderMax],
      )
      const trailingDistanceValue = useMemo(
        // we use the opposite value when handling state
        // it's hard to have the slider go from token price to zero, so we do the opposite
        // then the actual value (distance) is sliderMax (token price) minus "trailingDistance" value
        () => getTrailingDistanceValue(trailingDistance),
        [getTrailingDistanceValue, trailingDistance],
      )
      const trailingDistanceLambdaValue = useMemo(
        () =>
          getTrailingDistanceValue(
            (trailingStopLossLambdaData && trailingStopLossLambdaData.trailingDistance) || zero,
          ),
        [getTrailingDistanceValue, trailingStopLossLambdaData],
      )

      const collateralPriceInDebt = useMemo(
        () => collateralTokenPrice.div(debtTokenPrice),
        [collateralTokenPrice, debtTokenPrice],
      )
      const dynamicStopPrice = useMemo(() => {
        return priceRatio.minus(
          (trailingStopLossLambdaData && trailingStopLossLambdaData.trailingDistance) || zero,
        )
      }, [priceRatio, trailingStopLossLambdaData])
      const dynamicStopPriceChange = useMemo(() => {
        return priceRatio.minus(trailingDistanceValue)
      }, [priceRatio, trailingDistanceValue])
      const collateralDuringLiquidation = useMemo(
        () =>
          strategyInfo
            ? getCollateralDuringLiquidation({
                lockedCollateral,
                debt,
                liquidationPrice,
                liquidationPenalty: strategyInfo.liquidationBonus,
              })
            : one,
        [debt, liquidationPrice, lockedCollateral, strategyInfo],
      )
      const estimatedTokenOnSLTrigger = useMemo(
        () =>
          isCloseToCollateral
            ? lockedCollateral.times(dynamicStopPrice).minus(debt).div(dynamicStopPrice)
            : lockedCollateral.times(dynamicStopPrice).minus(debt),
        [debt, dynamicStopPrice, isCloseToCollateral, lockedCollateral],
      )
      const estimatedTokenOnSLTriggerChange = useMemo(
        () =>
          isCloseToCollateral
            ? lockedCollateral.times(dynamicStopPriceChange).minus(debt).div(dynamicStopPriceChange)
            : lockedCollateral.times(dynamicStopPriceChange).minus(debt),
        [debt, dynamicStopPriceChange, isCloseToCollateral, lockedCollateral],
      )
      const savingCompareToLiquidation = useMemo(
        () =>
          estimatedTokenOnSLTrigger.minus(
            isCloseToCollateral
              ? collateralDuringLiquidation
              : collateralDuringLiquidation.times(dynamicStopPriceChange),
          ),
        [
          collateralDuringLiquidation,
          dynamicStopPriceChange,
          estimatedTokenOnSLTrigger,
          isCloseToCollateral,
        ],
      )
      return {
        collateralPriceInDebt,
        priceRatio,
        collateralTokenPrice,
        debt,
        debtTokenPrice,
        dynamicStopPrice,
        dynamicStopPriceChange,
        estimatedTokenOnSLTrigger,
        estimatedTokenOnSLTriggerChange,
        liquidationPrice,
        liquidationRatio,
        lockedCollateral,
        positionRatio,
        savingCompareToLiquidation,
        sliderMax,
        sliderMin,
        sliderPercentageFill,
        sliderStep,
        trailingDistance,
        trailingDistanceLambdaValue,
        trailingDistanceValue,
      }
    },
  ),
}
