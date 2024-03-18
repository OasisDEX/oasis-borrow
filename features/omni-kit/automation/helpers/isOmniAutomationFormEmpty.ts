import { AutomationFeatures } from 'features/automation/common/types'
import type { OmniAutomationFormStates } from 'features/omni-kit/automation/types'
import type { OmniAutomationAutoBSFormState } from 'features/omni-kit/state/automation/auto-bs'
import type { OmniAutomationPartialTakeProfitFormState } from 'features/omni-kit/state/automation/partial-take-profit'
import type { OmniAutomationStopLossFormState } from 'features/omni-kit/state/automation/stop-loss'
import type { OmniAutomationTrailingStopLossFormState } from 'features/omni-kit/state/automation/trailing-stop-loss'
import { TriggerAction } from 'helpers/triggers'

// Handler to check whether state has been updated
// This handler shouldn't take into account predefined, default form values
// as for example maxGasFee or useThreshold
export const isOmniAutomationFormEmpty = (
  state: OmniAutomationFormStates,
  activeUiDropdown?: AutomationFeatures,
) => {
  if (!activeUiDropdown) {
    return true
  }

  if ('action' in state && state.action === TriggerAction.Remove) {
    return false
  }

  switch (activeUiDropdown) {
    case AutomationFeatures.STOP_LOSS:
      const stopLossState = state as OmniAutomationStopLossFormState
      return !stopLossState.triggerLtv && !stopLossState.resolveTo
    case AutomationFeatures.TRAILING_STOP_LOSS:
      const trailingStopLossState = state as OmniAutomationTrailingStopLossFormState
      return !trailingStopLossState.trailingDistance && !trailingStopLossState.resolveTo
    case AutomationFeatures.AUTO_SELL:
      const autoSellState = state as OmniAutomationAutoBSFormState
      return (
        (!autoSellState.targetLtv && !autoSellState.triggerLtv) ||
        (autoSellState.useThreshold && !autoSellState.price)
      )
    case AutomationFeatures.AUTO_BUY:
      const autoBuyState = state as OmniAutomationAutoBSFormState
      return (
        (!autoBuyState.targetLtv && !autoBuyState.triggerLtv) ||
        (autoBuyState.useThreshold && !autoBuyState.price)
      )
    case AutomationFeatures.PARTIAL_TAKE_PROFIT:
      const partialTakeProfitState = state as OmniAutomationPartialTakeProfitFormState
      return (
        !partialTakeProfitState.price &&
        !partialTakeProfitState.triggerLtv &&
        !partialTakeProfitState.ltvStep
      )
    default:
      return true
  }
}
