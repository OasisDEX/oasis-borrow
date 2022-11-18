import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import {
  DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
  NEXT_COLL_RATIO_OFFSET,
} from 'features/automation/common/consts'
import { GetStopLossMetadata } from 'features/automation/metadata/types'
import {
  getSliderPercentageFill,
  getStartingSlRatio,
} from 'features/automation/protection/stopLoss/helpers'
import {
  StopLossFormChange,
  StopLossResetData,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import {
  errorsStopLossValidation,
  warningsStopLossValidation,
} from 'features/automation/protection/stopLoss/validators'

// eslint-disable-next-line func-style
export const makerStopLossMetaData: GetStopLossMetadata = (context) => {
  const {
    autoSellTriggerData,
    stopLossTriggerData,
    constantMultipleTriggerData,
    positionData: { nextPositionRatio, liquidationRatio, lockedCollateral, debt },
  } = context

  const max = autoSellTriggerData.isTriggerEnabled
    ? autoSellTriggerData.execCollRatio.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET).div(100)
    : constantMultipleTriggerData.isTriggerEnabled
    ? constantMultipleTriggerData.sellExecutionCollRatio
        .minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET)
        .div(100)
    : nextPositionRatio.minus(NEXT_COLL_RATIO_OFFSET.div(100))
  const sliderMax = new BigNumber(max.multipliedBy(100).toFixed(0, BigNumber.ROUND_DOWN))

  const sliderMin = liquidationRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.div(100)).times(100)
  const selectedStopLossCollRatioIfTriggerDoesntExist = sliderMin.plus(
    DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  )
  const initialSlRatioWhenTriggerDoesntExist = getStartingSlRatio({
    stopLossLevel: stopLossTriggerData.stopLossLevel,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    initialStopLossSelected: selectedStopLossCollRatioIfTriggerDoesntExist,
  })
    .times(100)
    .decimalPlaces(0, BigNumber.ROUND_DOWN)

  const resetData: StopLossResetData = {
    stopLossLevel: initialSlRatioWhenTriggerDoesntExist,
    collateralActive: stopLossTriggerData.isToCollateral,
    txDetails: {},
  }

  return {
    getWarnings: ({
      state: { stopLossLevel },
      gasEstimationUsd,
    }: {
      state: StopLossFormChange
      gasEstimationUsd?: BigNumber
    }) =>
      warningsStopLossValidation({
        token: context.positionData.token,
        ethBalance: context.environmentData.ethBalance,
        ethPrice: context.environmentData.ethMarketPrice,
        triggerRatio: stopLossLevel,
        isAutoSellEnabled: context.autoSellTriggerData.isTriggerEnabled,
        isConstantMultipleEnabled: context.constantMultipleTriggerData.isTriggerEnabled,
        gasEstimationUsd,
        sliderMax,
      }),
    getErrors: ({ state: { txDetails, stopLossLevel } }: { state: StopLossFormChange }) =>
      errorsStopLossValidation({
        txError: txDetails?.txError,
        debt: context.positionData.debt,
        stopLossLevel,
        autoBuyTriggerData: context.autoBuyTriggerData,
      }),
    getExecutionPrice: ({ state }: { state: StopLossFormChange }) =>
      collateralPriceAtRatio({
        colRatio: state.stopLossLevel.div(100),
        collateral: lockedCollateral,
        vaultDebt: debt,
      }),
    getSliderPercentageFill: ({ state }: { state: StopLossFormChange }) =>
      getSliderPercentageFill({
        value: state.stopLossLevel,
        min: sliderMin,
        max: sliderMax,
      }),
    getRightBoundary: ({ state }: { state: StopLossFormChange }) =>
      state.stopLossLevel
        .dividedBy(100)
        .multipliedBy(context.environmentData.nextCollateralPrice)
        .dividedBy(nextPositionRatio),
    sliderMax,
    sliderMin,
    resetData,
    sliderLeftLabel: 'slider.set-stoploss.left-label',
    sliderRightLabel: 'slider.set-stoploss.right-label',
  }
}
