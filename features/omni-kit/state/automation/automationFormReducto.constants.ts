import type { OmniAutomationFormState } from 'features/omni-kit/state/automation'

export const omniAutomationFormReset = {
  targetLtv: undefined,
  triggerLtv: undefined,
  trailingDistance: undefined,
  minSellPrice: undefined,
  maxBuyPrice: undefined,
  maxGasFee: undefined,
  ltvStep: undefined,
  percentageOffset: undefined,
  uiDropdown: undefined,
  resolveTo: undefined,
}

export const omniAutomationFormDefault: OmniAutomationFormState = {
  ...omniAutomationFormReset,
}
