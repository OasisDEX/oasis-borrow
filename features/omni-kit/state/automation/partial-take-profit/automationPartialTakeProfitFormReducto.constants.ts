import BigNumber from 'bignumber.js'
import type { OmniAutomationPartialTakeProfitFormState } from 'features/omni-kit/state/automation/partial-take-profit'

export const omniAutomationPartialTakeProfitFormReset = {
  targetLtv: undefined,
  triggerLtv: undefined,
  extraTriggerLtv: undefined,
  trailingDistance: undefined,
  price: undefined,
  maxGasFee: new BigNumber(300),
  ltvStep: undefined,
  percentageOffset: undefined,
  useThreshold: true,
}

export const omniAutomationPartialTakeProfitFormDefault: Partial<OmniAutomationPartialTakeProfitFormState> =
  {
    ...omniAutomationPartialTakeProfitFormReset,
  }
