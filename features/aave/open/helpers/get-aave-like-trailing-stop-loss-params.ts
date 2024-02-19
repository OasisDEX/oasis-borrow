import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { getSliderPercentageFill } from 'features/automation/protection/stopLoss/helpers'
import { one, zero } from 'helpers/zero'
import { memoize } from 'lodash'

const getSliderStep = (tokenPrice: BigNumber) => {
  if (tokenPrice.isGreaterThan(100000)) {
    return 10000
  }
  if (tokenPrice.isGreaterThan(10000)) {
    return 1000
  }
  if (tokenPrice.isGreaterThan(1000)) {
    return 100
  }
  if (tokenPrice.isGreaterThan(100)) {
    return 10
  }
  if (tokenPrice.isGreaterThan(10)) {
    return 1
  }
  if (tokenPrice.isGreaterThan(1)) {
    return 0.1
  }
  return 0.001
}

export const getAaveLikeTrailingStopLossParams = {
  manage: ({ state }: Pick<ManageAaveStateProps, 'state'>) => {
    // some of the numbers might be counter intuitive
    // firstly im getting a step for the slider (higher price -> higher step)
    // then im setting a minimum (highest trailing distance) to be a slider step value
    // as this is the lowest value that makes sense
    const collateralTokenPrice = state.context?.strategyInfo?.oracleAssetPrice.collateral || one
    const sliderStep = getSliderStep(collateralTokenPrice)
    const sliderMin = new BigNumber(sliderStep)
    const contextTrailingDistance = state.context.trailingDistance
    // then the trailing distance - if it's lower (by default) than the slider min, I'm setting it to the slider min
    const trailingDistance = memoize(
      // this is NOT actual trailing distance, but the value that will be displayed on the slider
      // the actual one is calculated in the request later
      // (this needs to be parsed the other way around as well - the value from lambda)
      () => {
        if (contextTrailingDistance) {
          return contextTrailingDistance.lt(sliderMin) ? sliderMin : contextTrailingDistance
        }
        return sliderMin
      },
      () => contextTrailingDistance?.toString(),
    )()
    // then the maximum value is the price divided by the step, floored and then multiplied by the step
    // so in the end we get a rounded numbers
    const sliderMax = new BigNumber(
      collateralTokenPrice.div(sliderStep).toFixed(0, BigNumber.ROUND_DOWN),
    ).times(sliderStep)
    const debt = amountFromWei(
      state.context.currentPosition?.debt.amount || zero,
      state.context.currentPosition?.debt.precision,
    )

    const lockedCollateral = amountFromWei(
      state.context.currentPosition?.collateral.amount || zero,
      state.context.currentPosition?.collateral.precision,
    )
    const positionRatio = state.context.currentPosition?.riskRatio.loanToValue || zero
    const liquidationRatio = state.context?.currentPosition?.category.liquidationThreshold || zero
    const liquidationPrice = debt.div(lockedCollateral.times(liquidationRatio)) || zero

    const sliderPercentageFill = getSliderPercentageFill({
      min: sliderMin,
      max: sliderMax.minus(sliderStep),
      value: trailingDistance,
    })
    return {
      trailingDistance,
      positionRatio,
      liquidationRatio,
      sliderMin,
      sliderMax,
      debt,
      lockedCollateral,
      liquidationPrice,
      sliderPercentageFill,
      collateralTokenPrice,
      sliderStep,
    }
  },
}
