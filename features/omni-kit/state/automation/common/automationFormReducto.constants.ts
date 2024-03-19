import type { OmniAutomationFormState } from 'features/omni-kit/state/automation/common/index'

export const omniAutomationFormReset = {
  uiDropdownOptimization: undefined,
  uiDropdownProtection: undefined,
  activeTxUiDropdown: undefined,
  activeAction: undefined,
}

export const omniAutomationFormDefault: OmniAutomationFormState = {
  ...omniAutomationFormReset,
}
