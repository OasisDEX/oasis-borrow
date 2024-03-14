import BigNumber from 'bignumber.js'
import type { OmniAutomationFormState } from 'features/omni-kit/state/automation'

export const omniAutomationFormReset = {
  targetLtv: undefined,
  triggerLtv: undefined,
  extraTriggerLtv: undefined,
  trailingDistance: undefined,
  minSellPrice: undefined,
  maxBuyPrice: undefined,
  takePrice: undefined,
  maxGasFee: new BigNumber(300),
  ltvStep: undefined,
  percentageOffset: undefined,
  resolveTo: undefined,
  useThreshold: true,
  action: undefined,
}

export const omniAutomationFormDefault: OmniAutomationFormState = {
  ...omniAutomationFormReset,
}
