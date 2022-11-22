/* eslint-disable func-style */

import {
  AutomationValidationMethod,
  AutomationValidationSet,
  AutomationValidationSetWithGeneric,
  ContextWithoutMetadata,
} from 'features/automation/metadata/types'

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
  return validators
    .filter(([fn, state]) => fn({ context, state: state || {} }))
    .map(([fn]) => fn.name)
}

export function filterAutomationValidations({
  messages,
  toFilter,
}: {
  messages: string[]
  toFilter: string[]
}) {
  return messages.filter((message) => toFilter.includes(message))
}
