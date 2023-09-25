import type { TriggersData } from 'features/automation/api/automationTriggersData.types'

export function getShouldRemoveAllowance(automationTriggersData: TriggersData) {
  return automationTriggersData.triggers?.length === 1
}
