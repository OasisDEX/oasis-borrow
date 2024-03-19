import type {
  OmniAutomationAutoBSFormActions,
  OmniAutomationAutoBSFormState,
} from 'features/omni-kit/state/automation/auto-bs'
import {
  omniAutomationAutoBSFormDefault,
  omniAutomationAutoBSFormReset,
} from 'features/omni-kit/state/automation/auto-bs'
import { useReducto } from 'helpers/useReducto'

export function useOmniAutomationAutoBSFormReducto({ ...rest }: OmniAutomationAutoBSFormState) {
  const { dispatch, state, updateState } = useReducto<
    OmniAutomationAutoBSFormState,
    OmniAutomationAutoBSFormActions
  >({
    defaults: {
      ...omniAutomationAutoBSFormDefault,
      ...rest,
    },
    reducer: (
      prevState: OmniAutomationAutoBSFormState,
      action: OmniAutomationAutoBSFormActions,
    ) => {
      switch (action.type) {
        case 'update-target-ltv':
          return {
            ...prevState,
            targetLtv: action.targetLtv,
          }
        case 'update-trigger-ltv':
          return {
            ...prevState,
            triggerLtv: action.triggerLtv,
          }
        case 'update-price':
          return {
            ...prevState,
            takePrice: action.price,
          }
        case 'update-max-gas-fee':
          return {
            ...prevState,
            maxGasFee: action.maxGasFee,
          }
        case 'update-use-threshold':
          return {
            ...prevState,
            useThreshold: action.useThreshold,
          }
        case 'update-action':
          return {
            ...prevState,
            action: action.action,
          }
        case 'reset':
          return { ...prevState, ...omniAutomationAutoBSFormReset, ...rest }
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
