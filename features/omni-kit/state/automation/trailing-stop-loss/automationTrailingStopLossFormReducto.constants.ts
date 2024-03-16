import type { OmniAutomationTrailingStopLossFormState } from 'features/omni-kit/state/automation/trailing-stop-loss'

export const omniAutomationTrailingStopLossFormReset = {
  trailingDistance: undefined,
  price: undefined,
}

export const omniAutomationTrailingStopLossFormDefault: Partial<OmniAutomationTrailingStopLossFormState> =
  {
    ...omniAutomationTrailingStopLossFormReset,
  }
