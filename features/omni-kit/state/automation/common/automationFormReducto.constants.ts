import type { OmniAutomationFormState } from 'features/omni-kit/state/automation/common/index'

export const omniAutomationFormReset = {
  uiDropdownOptimization: undefined,
  uiDropdownProtection: undefined,
}

export const omniAutomationFormDefault: OmniAutomationFormState = {
  ...omniAutomationFormReset,
}
