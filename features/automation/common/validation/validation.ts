import type { AutomationMetadataValidationResult } from 'features/automation/metadata/types'

export function extractAutomationValidations({
  validations,
}: {
  validations: AutomationMetadataValidationResult
}) {
  return Object.entries(validations)
    .filter(([, value]) => value)
    .map(([value]) => value)
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
