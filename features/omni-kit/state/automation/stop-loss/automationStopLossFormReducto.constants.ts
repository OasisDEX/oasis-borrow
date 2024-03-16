import type { OmniAutomationStopLossFormState } from 'features/omni-kit/state/automation/stop-loss'

export const omniAutomationStopLossFormReset = {
  triggerLtv: undefined,
}

export const omniAutomationStopLossFormDefault: Partial<OmniAutomationStopLossFormState> = {
  ...omniAutomationStopLossFormReset,
}
