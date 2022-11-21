/* eslint-disable func-style */

import {
  AutomationValidationMethod,
  AutomationValidationMethodParams,
  AutomationValidationSet,
  ContextWithoutMetadata,
} from 'features/automation/metadata/types'
import { TxError } from 'helpers/types'

export function triggerAutomationValidations({
  context,
  validators,
}: {
  context: ContextWithoutMetadata
  validators: AutomationValidationSet[]
}) {
  return validators.filter(([fn, state]) => fn({ context, state })).map(([fn]) => fn.name)
}

export const randomValidatorThatAlwaysReturnsTrueAndUsesContext: AutomationValidationMethod = ({
  context,
}) => {
  console.log('randomValidatorThatAlwaysReturnsTrueAndUsesContext')
  console.log(context)

  return true
}

export function randomValidatorThatAlwaysReturnsTrueAndUsesState({
  state,
}: AutomationValidationMethodParams | { state: { txError?: TxError } }): boolean {
  console.log('randomValidatorThatAlwaysReturnsTrueAndUsesState')
  console.log(state)
  console.log(state?.txError)

  return true
}

export const randomValidatorThatAlwaysReturnsTrue: AutomationValidationMethod = () => {
  return true
}
