import type { OmniAutomationTrailingStopLossFormState } from 'features/omni-kit/state/automation/trailing-stop-loss'

export const omniAutomationTrailingStopLossFormReset = {
  trailingDistance: undefined,
  resolveTo: undefined,
  price: undefined,
}

export const omniAutomationTrailingStopLossFormDefault: Partial<OmniAutomationTrailingStopLossFormState> =
  {
    ...omniAutomationTrailingStopLossFormReset,
  }
