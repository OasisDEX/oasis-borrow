import type {
  OmniAutomationPartialTakeProfitFormActions,
  OmniAutomationPartialTakeProfitFormState,
} from 'features/omni-kit/state/automation/partial-take-profit'
import {
  omniAutomationPartialTakeProfitFormDefault,
  omniAutomationPartialTakeProfitFormReset,
} from 'features/omni-kit/state/automation/partial-take-profit'
import { useReducto } from 'helpers/useReducto'

export function useOmniAutomationPartialTakeProfitFormReducto({
  ...rest
}: OmniAutomationPartialTakeProfitFormState) {
  const { dispatch, state, updateState } = useReducto<
    OmniAutomationPartialTakeProfitFormState,
    OmniAutomationPartialTakeProfitFormActions
  >({
    defaults: {
      ...omniAutomationPartialTakeProfitFormDefault,
      ...rest,
    },
    reducer: (
      prevState: OmniAutomationPartialTakeProfitFormState,
      action: OmniAutomationPartialTakeProfitFormActions,
    ) => {
      switch (action.type) {
        case 'update-trigger-ltv':
          return {
            ...prevState,
            triggerLtv: action.triggerLtv,
          }
        case 'update-extra-trigger-ltv':
          return {
            ...prevState,
            extraTriggerLtv: action.extraTriggerLtv,
          }
        case 'update-price':
          return {
            ...prevState,
            takePrice: action.price,
          }
        case 'update-ltv-step':
          return {
            ...prevState,
            ltvStep: action.ltvStep,
          }
        case 'update-percentage-offset':
          return {
            ...prevState,
            percentageOffset: action.percentageOffset,
          }
        case 'update-action':
          return {
            ...prevState,
            action: action.action,
          }
        case 'reset':
          return { ...prevState, ...omniAutomationPartialTakeProfitFormReset, ...rest }
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
