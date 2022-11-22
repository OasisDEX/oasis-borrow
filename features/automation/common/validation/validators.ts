/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import {
  MAX_DEBT_FOR_SETTING_STOP_LOSS,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'features/automation/common/consts'
import {
  AutomationValidationMethodParams,
  AutomationValidationMethodStateReturn,
} from 'features/automation/metadata/types'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { TxError } from 'helpers/types'

// TODO: after redoing all automation validations, this file should be split into: common, protection, optimization and then for each feature

export function hasInsufficientEthFundsForTx({
  state: { txError },
}: AutomationValidationMethodParams<{ txError?: TxError }>): AutomationValidationMethodStateReturn {
  return ethFundsForTxValidator({ txError })
}

export function hasMoreDebtThanMaxForStopLoss({
  context: {
    positionData: { debt },
  },
}: AutomationValidationMethodParams): AutomationValidationMethodStateReturn {
  return debt.gt(MAX_DEBT_FOR_SETTING_STOP_LOSS)
}

export function isStopLossTriggerHigherThanAutoBuyTarget({
  state: { stopLossLevel },
  context: { autoBuyTriggerData },
}: AutomationValidationMethodParams<{
  stopLossLevel?: BigNumber
}>): AutomationValidationMethodStateReturn {
  return stopLossLevel && autoBuyTriggerData?.isTriggerEnabled
    ? stopLossLevel.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET).gt(autoBuyTriggerData.targetCollRatio)
    : false
}

export function hasPotentialInsufficientEthFundsForTx({
  context: {
    environmentData: { ethBalance, ethMarketPrice },
    positionData: { token },
  },
  state: { gasEstimationUsd },
}: AutomationValidationMethodParams<{
  gasEstimationUsd?: BigNumber
}>): AutomationValidationMethodStateReturn {
  return notEnoughETHtoPayForTx({
    token,
    gasEstimationUsd,
    ethBalance,
    ethPrice: ethMarketPrice,
  })
}

export function isStopLossTriggerCloseToAutoSellTrigger({
  context: { autoSellTriggerData },
  state: { sliderMax, stopLossLevel },
}: AutomationValidationMethodParams<{
  sliderMax?: BigNumber
  stopLossLevel?: BigNumber
}>): AutomationValidationMethodStateReturn {
  return autoSellTriggerData.isTriggerEnabled && sliderMax && stopLossLevel?.isEqualTo(sliderMax)
}

export function isStopLossTriggerCloseToConstantMultipleSellTrigger({
  context: { constantMultipleTriggerData },
  state: { sliderMax, stopLossLevel },
}: AutomationValidationMethodParams<{
  sliderMax?: BigNumber
  stopLossLevel?: BigNumber
}>): AutomationValidationMethodStateReturn {
  return (
    constantMultipleTriggerData.isTriggerEnabled && sliderMax && stopLossLevel?.isEqualTo(sliderMax)
  )
}
