import type { OmniAutomationAutoBSFormState } from 'features/omni-kit/state/automation/auto-bs'

export const omniAutomationAutoBSFormReset = {
  targetLtv: undefined,
  triggerLtv: undefined,
  price: undefined,
  maxGasFee: undefined,
  useThreshold: undefined,
}

export const omniAutomationAutoBSFormDefault: Partial<OmniAutomationAutoBSFormState> = {
  ...omniAutomationAutoBSFormReset,
}
