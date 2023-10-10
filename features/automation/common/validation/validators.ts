/* eslint-disable func-style */

import type BigNumber from 'bignumber.js'
import {
  MAX_DEBT_FOR_SETTING_STOP_LOSS,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'features/automation/common/consts'
import type {
  AutomationValidationMethodParams,
  AutomationValidationMethodStateResult,
} from 'features/automation/metadata/types'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import type { TxError } from 'helpers/types'

// TODO: after redoing all automation validations, this file should be split into: common, protection, optimization and then for each feature

export function hasInsufficientEthFundsForTx({
  txError,
}: AutomationValidationMethodParams<{ txError?: TxError }>): AutomationValidationMethodStateResult {
  return ethFundsForTxValidator({ txError })
}

export function hasMoreDebtThanMaxForStopLoss({
  context: {
    positionData: { debt },
  },
}: AutomationValidationMethodParams): AutomationValidationMethodStateResult {
  return debt.gt(MAX_DEBT_FOR_SETTING_STOP_LOSS)
}

export function isStopLossTriggerHigherThanAutoBuyTarget({
  context: {
    triggerData: { autoBuyTriggerData },
  },
  stopLossLevel,
}: AutomationValidationMethodParams<{
  stopLossLevel?: BigNumber
}>): AutomationValidationMethodStateResult {
  return stopLossLevel && autoBuyTriggerData?.isTriggerEnabled
    ? stopLossLevel.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET).gt(autoBuyTriggerData.targetCollRatio)
    : false
}

export function hasPotentialInsufficientEthFundsForTx({
  context: {
    environmentData: { ethBalance, ethMarketPrice },
    positionData: { token },
  },
  gasEstimationUsd,
}: AutomationValidationMethodParams<{
  gasEstimationUsd?: BigNumber
}>): AutomationValidationMethodStateResult {
  return notEnoughETHtoPayForTx({
    token,
    gasEstimationUsd,
    ethBalance,
    ethPrice: ethMarketPrice,
  })
}

export function isStopLossTriggerCloseToAutoSellTrigger({
  context: {
    triggerData: { autoSellTriggerData },
  },
  sliderMax,
  stopLossLevel,
}: AutomationValidationMethodParams<{
  sliderMax?: BigNumber
  stopLossLevel?: BigNumber
}>): AutomationValidationMethodStateResult {
  return autoSellTriggerData.isTriggerEnabled && sliderMax && stopLossLevel?.isEqualTo(sliderMax)
}

export function isStopLossTriggerCloseToConstantMultipleSellTrigger({
  context: {
    triggerData: { constantMultipleTriggerData },
  },
  sliderMax,
  stopLossLevel,
}: AutomationValidationMethodParams<{
  sliderMax?: BigNumber
  stopLossLevel?: BigNumber
}>): AutomationValidationMethodStateResult {
  return (
    constantMultipleTriggerData.isTriggerEnabled && sliderMax && stopLossLevel?.isEqualTo(sliderMax)
  )
}
