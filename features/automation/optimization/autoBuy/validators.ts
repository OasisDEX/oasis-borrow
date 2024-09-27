import type BigNumber from 'bignumber.js'
import { MIX_MAX_COL_RATIO_TRIGGER_OFFSET } from 'features/automation/common/consts'
import type { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange.types'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'
import { zero } from 'helpers/zero'

export function warningsAutoBuyValidation({
  gasEstimationUsd,
  ethBalance,
  ethPrice,
  sliderMin,
  isStopLossEnabled,
  isAutoSellEnabled,
  isAutoTakeProfitEnabled,
  autoBuyState,
  withThreshold,
  executionPrice,
  autoTakeProfitExecutionPrice,
  token,
  nextPositionRatio,
}: {
  ethBalance: BigNumber
  ethPrice: BigNumber
  sliderMin: BigNumber
  gasEstimationUsd?: BigNumber
  isStopLossEnabled: boolean
  isAutoSellEnabled: boolean
  isAutoTakeProfitEnabled: boolean
  autoBuyState: AutoBSFormChange
  minSellPrice?: BigNumber
  withThreshold: boolean
  executionPrice: BigNumber
  autoTakeProfitExecutionPrice: BigNumber
  token: string
  nextPositionRatio: BigNumber
}) {
  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })

  const autoBuyTargetCloseToStopLossTrigger =
    isStopLossEnabled && !isAutoSellEnabled && autoBuyState.targetCollRatio.isEqualTo(sliderMin)

  const autoBuyTargetCloseToAutoSellTrigger =
    isAutoSellEnabled && autoBuyState.targetCollRatio.isEqualTo(sliderMin)

  const settingAutoBuyTriggerWithNoThreshold = !withThreshold

  const autoBuyTriggeredImmediately = autoBuyState.execCollRatio.div(100).lte(nextPositionRatio)

  const autoBuyTriggerGreaterThanAutoTakeProfit =
    isAutoTakeProfitEnabled && executionPrice.gt(autoTakeProfitExecutionPrice)

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    settingAutoBuyTriggerWithNoThreshold,
    autoBuyTargetCloseToStopLossTrigger,
    autoBuyTargetCloseToAutoSellTrigger,
    autoBuyTriggeredImmediately,
    autoBuyTriggerGreaterThanAutoTakeProfit,
  })
}

export function errorsAutoBuyValidation({
  autoBuyState,
  autoSellTriggerData,
  isRemoveForm,
  executionPrice,
}: {
  autoBuyState: AutoBSFormChange
  autoSellTriggerData: AutoBSTriggerData
  isRemoveForm: boolean
  executionPrice: BigNumber
}) {
  const { maxBuyOrMinSellPrice, txDetails, withThreshold, execCollRatio } = autoBuyState
  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError: txDetails?.txError })

  const autoBuyMaxBuyPriceNotSpecified =
    !isRemoveForm && withThreshold && (!maxBuyOrMinSellPrice || maxBuyOrMinSellPrice.isZero())

  const autoBuyTriggerLowerThanAutoSellTarget =
    autoSellTriggerData.isTriggerEnabled &&
    execCollRatio.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET).lt(autoSellTriggerData.targetCollRatio)

  const maxBuyPriceWillPreventBuyTrigger =
    maxBuyOrMinSellPrice?.gt(zero) && maxBuyOrMinSellPrice.lt(executionPrice)

  return errorMessagesHandler({
    insufficientEthFundsForTx,
    autoBuyMaxBuyPriceNotSpecified,
    autoBuyTriggerLowerThanAutoSellTarget,
    maxBuyPriceWillPreventBuyTrigger,
  })
}
