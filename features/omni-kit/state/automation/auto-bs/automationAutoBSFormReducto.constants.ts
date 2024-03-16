import BigNumber from 'bignumber.js'
import type { OmniAutomationAutoBSFormState } from 'features/omni-kit/state/automation/auto-bs'

export const omniAutomationAutoBSFormReset = {
  targetLtv: undefined,
  triggerLtv: undefined,
  price: undefined,
  maxGasFee: new BigNumber(300),
  useThreshold: true,
}

export const omniAutomationAutoBSFormDefault: Partial<OmniAutomationAutoBSFormState> = {
  ...omniAutomationAutoBSFormReset,
}
