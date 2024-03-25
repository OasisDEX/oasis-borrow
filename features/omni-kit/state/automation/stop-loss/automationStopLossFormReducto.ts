import type {
  OmniAutomationStopLossFormActions,
  OmniAutomationStopLossFormState,
} from 'features/omni-kit/state/automation/stop-loss'
import {
  omniAutomationStopLossFormDefault,
  omniAutomationStopLossFormReset,
} from 'features/omni-kit/state/automation/stop-loss'
import { useReducto } from 'helpers/useReducto'

export function useOmniStopLossAutomationFormReducto({ ...rest }: OmniAutomationStopLossFormState) {
  const { dispatch, state, updateState } = useReducto<
    OmniAutomationStopLossFormState,
    OmniAutomationStopLossFormActions
  >({
    defaults: {
      ...omniAutomationStopLossFormDefault,
      ...rest,
    },
    reducer: (
      prevState: OmniAutomationStopLossFormState,
      action: OmniAutomationStopLossFormActions,
    ) => {
      switch (action.type) {
        case 'update-trigger-ltv':
          return {
            ...prevState,
            triggerLtv: action.triggerLtv,
          }
        case 'update-action':
          return {
            ...prevState,
            action: action.action,
          }
        case 'reset':
          return { ...prevState, ...omniAutomationStopLossFormReset, ...rest }
        default:
          return prevState
      }
    },
  })

  return {
    dispatch,
    state,
    updateState,
  }
}
