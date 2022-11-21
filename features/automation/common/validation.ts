/* eslint-disable func-style */

import { MAX_DEBT_FOR_SETTING_STOP_LOSS } from 'features/automation/common/consts'
import {
  AutomationValidationMethod,
  AutomationValidationMethodParams,
  AutomationValidationSet,
  AutomationValidationSetWithGeneric,
  ContextWithoutMetadata,
} from 'features/automation/metadata/types'
import { ethFundsForTxValidator } from 'features/form/commonValidators'
import { TxError } from 'helpers/types'

export function getAutomationValidationStateSet<T extends AutomationValidationMethod>([
  fn,
  state,
]: AutomationValidationSetWithGeneric<Parameters<T>[0]['state']>): AutomationValidationSet {
  return [fn, state]
}

export function triggerAutomationValidations({
  context,
  validators,
}: {
  context: ContextWithoutMetadata
  validators: AutomationValidationSet[]
}) {
  return validators.filter(([fn, state]) => fn({ context, state })).map(([fn]) => fn.name)
}

export function hasInsufficientEthFundsForTx({
  state: { txError },
}: AutomationValidationMethodParams<{ txError?: TxError }>): boolean {
  return ethFundsForTxValidator({ txError })
}

export const hasMoreDebtThanMaxForStopLoss: AutomationValidationMethod = ({
  context: {
    positionData: { debt },
  },
}) => {
  return debt.gt(MAX_DEBT_FOR_SETTING_STOP_LOSS)
}
