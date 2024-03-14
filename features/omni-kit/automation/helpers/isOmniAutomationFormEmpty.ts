import { AutomationFeatures } from 'features/automation/common/types'
import type { OmniAutomationFormState } from 'features/omni-kit/state/automation'

// Handler to check whether state has been updated
// This handler shouldn't take into account predefined, default form values
// as for example maxGasFee or useThreshold
export const isOmniAutomationFormEmpty = (
  state: OmniAutomationFormState,
  activeUiDropdown?: AutomationFeatures,
) => {
  if (!activeUiDropdown) {
    return true
  }

  switch (activeUiDropdown) {
    case AutomationFeatures.STOP_LOSS:
      return !state.triggerLtv && !state.resolveTo
    case AutomationFeatures.TRAILING_STOP_LOSS:
      return !state.trailingDistance && !state.resolveTo
    case AutomationFeatures.AUTO_SELL:
      return (!state.targetLtv && !state.triggerLtv) || (state.useThreshold && !state.minSellPrice)
    case AutomationFeatures.AUTO_BUY:
      return (!state.targetLtv && !state.triggerLtv) || (state.useThreshold && !state.maxBuyPrice)
    case AutomationFeatures.PARTIAL_TAKE_PROFIT:
      return !state.resolveTo && !state.price && !state.triggerLtv && !state.ltvStep
    default:
      return true
  }
}
