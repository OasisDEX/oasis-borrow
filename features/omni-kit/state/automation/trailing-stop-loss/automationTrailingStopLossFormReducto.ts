import type {
  OmniAutomationTrailingStopLossFormActions,
  OmniAutomationTrailingStopLossFormState,
} from 'features/omni-kit/state/automation/trailing-stop-loss'
import {
  omniAutomationTrailingStopLossFormDefault,
  omniAutomationTrailingStopLossFormReset,
} from 'features/omni-kit/state/automation/trailing-stop-loss'
import { useReducto } from 'helpers/useReducto'

export function useOmniAutomationTrailingStopLossFormReducto({
  ...rest
}: OmniAutomationTrailingStopLossFormState) {
  const { dispatch, state, updateState } = useReducto<
    OmniAutomationTrailingStopLossFormState,
    OmniAutomationTrailingStopLossFormActions
  >({
    defaults: {
      ...omniAutomationTrailingStopLossFormDefault,
      ...rest,
    },
    reducer: (
      prevState: OmniAutomationTrailingStopLossFormState,
      action: OmniAutomationTrailingStopLossFormActions,
    ) => {
      switch (action.type) {
        case 'update-trailing-distance':
          return {
            ...prevState,
            trailingDistance: action.trailingDistance,
          }
        case 'update-price':
          return {
            ...prevState,
            takePrice: action.price,
          }
        case 'update-action':
          return {
            ...prevState,
            action: action.action,
          }
        case 'reset':
          return { ...prevState, ...omniAutomationTrailingStopLossFormReset, ...rest }
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
