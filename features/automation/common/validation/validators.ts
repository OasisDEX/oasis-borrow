/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import {
  MAX_DEBT_FOR_SETTING_STOP_LOSS,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'features/automation/common/consts'
import { AutomationValidationMethodParams } from 'features/automation/metadata/types'
import { ethFundsForTxValidator } from 'features/form/commonValidators'
import { TxError } from 'helpers/types'

// TODO: after redoing all automation validations, this file should be split into: common, protection, optimization and then for each feature

export function hasInsufficientEthFundsForTx({
  state: { txError },
}: AutomationValidationMethodParams<{ txError?: TxError }>): boolean {
  return ethFundsForTxValidator({ txError })
}

export function hasMoreDebtThanMaxForStopLoss({
  context: {
    positionData: { debt },
  },
}: AutomationValidationMethodParams): boolean {
  return debt.gt(MAX_DEBT_FOR_SETTING_STOP_LOSS)
}

export function isStopLossTriggerHigherThanAutoBuyTarget({
  state: { stopLossLevel },
  context: { autoBuyTriggerData },
}: AutomationValidationMethodParams<{ stopLossLevel?: BigNumber }>): boolean {
  return stopLossLevel && autoBuyTriggerData?.isTriggerEnabled
    ? stopLossLevel.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET).gt(autoBuyTriggerData.targetCollRatio)
    : false
}
