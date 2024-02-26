import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import type {
  OpenAaveEditingStateProps,
  OpenAaveStateProps,
} from 'features/aave/open/sidebars/sidebar.types'
import { StrategyType } from 'features/aave/types'
import { aaveOffsets } from 'features/automation/metadata/aave/stopLossMetadata'
import {
  getDynamicStopLossPrice,
  getSliderPercentageFill,
} from 'features/automation/protection/stopLoss/helpers'
import { one, zero } from 'helpers/zero'
import { memoize } from 'lodash'

export const getAaveLikeStopLossParams = {
  open: memoize(({ state }: Pick<OpenAaveStateProps | OpenAaveEditingStateProps, 'state'>) => {
    const stopLossLevel = state.context.stopLossLevel || zero
    const positionRatio =
      state.context.transition?.simulation.position.riskRatio.loanToValue || zero
    const liquidationRatio =
      state.context?.transition?.simulation.position.category.liquidationThreshold || zero
    const sliderMin = new BigNumber(
      positionRatio.plus(aaveOffsets.open.min).times(100).toFixed(0, BigNumber.ROUND_UP),
    )
    const sliderMax = liquidationRatio.minus(aaveOffsets.open.max).times(100)
    const debt = amountFromWei(
      state.context.transition?.simulation.position.debt.amount || zero,
      state.context.transition?.simulation.position.debt.precision,
    )

    const lockedCollateral = amountFromWei(
      state.context.transition?.simulation.position.collateral.amount || zero,
      state.context.transition?.simulation.position.collateral.precision,
    )
    const liquidationPrice = debt.div(lockedCollateral.times(liquidationRatio)) || zero

    const sliderPercentageFill = getSliderPercentageFill({
      min: sliderMin,
      max: sliderMax,
      value: stopLossLevel,
    })
    const dynamicStopLossPrice = getDynamicStopLossPrice({
      liquidationPrice,
      liquidationRatio: one.div(liquidationRatio),
      stopLossLevel: one.div(stopLossLevel.div(100)).times(100),
    })

    const stopLossTxData = state.context.stopLossTxDataLambda
    const strategy = state.context.strategyConfig

    const dynamicStopLossPriceForView =
      strategy.strategyType === StrategyType.Short
        ? one.div(dynamicStopLossPrice)
        : dynamicStopLossPrice

    return {
      stopLossLevel,
      positionRatio,
      liquidationRatio,
      sliderMin,
      sliderMax,
      debt,
      lockedCollateral,
      liquidationPrice,
      sliderPercentageFill,
      dynamicStopLossPrice,
      stopLossTxData,
      strategy,
      dynamicStopLossPriceForView,
    }
  }),
  manage: memoize(({ state }: Pick<ManageAaveStateProps, 'state'>) => {
    const stopLossLevel = state.context.stopLossLevel || zero
    const positionRatio = state.context.currentPosition?.riskRatio.loanToValue || zero
    const liquidationRatio = state.context?.currentPosition?.category.liquidationThreshold || zero
    const sliderMin = new BigNumber(
      positionRatio.plus(aaveOffsets.open.min).times(100).toFixed(0, BigNumber.ROUND_UP),
    )
    const sliderMax = liquidationRatio.minus(aaveOffsets.open.max).times(100)
    const debt = amountFromWei(
      state.context.currentPosition?.debt.amount || zero,
      state.context.currentPosition?.debt.precision,
    )

    const lockedCollateral = amountFromWei(
      state.context.currentPosition?.collateral.amount || zero,
      state.context.currentPosition?.collateral.precision,
    )
    const liquidationPrice = debt.div(lockedCollateral.times(liquidationRatio)) || zero

    const sliderPercentageFill = getSliderPercentageFill({
      min: sliderMin,
      max: sliderMax,
      value: stopLossLevel,
    })
    const dynamicStopLossPrice = getDynamicStopLossPrice({
      liquidationPrice,
      liquidationRatio: one.div(liquidationRatio),
      stopLossLevel: one.div(stopLossLevel.div(100)).times(100),
    })

    const stopLossTxData = state.context.stopLossTxDataLambda
    const strategy = state.context.strategyConfig

    const dynamicStopLossPriceForView =
      strategy.strategyType === StrategyType.Short
        ? one.div(dynamicStopLossPrice)
        : dynamicStopLossPrice

    return {
      stopLossLevel,
      positionRatio,
      liquidationRatio,
      sliderMin,
      sliderMax,
      debt,
      lockedCollateral,
      liquidationPrice,
      sliderPercentageFill,
      dynamicStopLossPrice,
      stopLossTxData,
      strategy,
      dynamicStopLossPriceForView,
    }
  }),
}
