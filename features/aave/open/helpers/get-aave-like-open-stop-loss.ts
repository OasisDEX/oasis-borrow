import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import type {
  OpenAaveEditingStateProps,
  OpenAaveStateProps,
} from 'features/aave/open/sidebars/sidebar.types'
import { aaveOffsets } from 'features/automation/metadata/aave/stopLossMetadata'
import {
  getDynamicStopLossPrice,
  getSliderPercentageFill,
} from 'features/automation/protection/stopLoss/helpers'
import { one, zero } from 'helpers/zero'

export const getAaveLikeOpenStopLossParams = ({
  state,
}: Pick<OpenAaveStateProps | OpenAaveEditingStateProps, 'state'>) => {
  const stopLossLevel = state.context.stopLossLevel || zero
  const positionRatio = state.context.transition?.simulation.position.riskRatio.loanToValue || zero
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
  const rightBoundry = getDynamicStopLossPrice({
    liquidationPrice,
    liquidationRatio: one.div(liquidationRatio),
    stopLossLevel: one.div(stopLossLevel.div(100)).times(100),
  })
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
    rightBoundry,
  }
}
