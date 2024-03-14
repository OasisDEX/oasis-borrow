import type {
  OmniAutomationFormActions,
  OmniAutomationFormState,
} from 'features/omni-kit/state/automation'
import {
  omniAutomationFormDefault,
  omniAutomationFormReset,
} from 'features/omni-kit/state/automation'
import { useReducto } from 'helpers/useReducto'

export function useOmniAutomationFormReducto({ ...rest }: Partial<OmniAutomationFormState>) {
  const { dispatch, state, updateState } = useReducto<
    OmniAutomationFormState,
    OmniAutomationFormActions
  >({
    defaults: {
      ...omniAutomationFormDefault,
      ...rest,
    },
    reducer: (prevState: OmniAutomationFormState, action: OmniAutomationFormActions) => {
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
        case 'update-extra-trigger-ltv':
          return {
            ...prevState,
            extraTriggerLtv: action.extraTriggerLtv,
          }
        case 'update-trailing-distance':
          return {
            ...prevState,
            trailingDistance: action.trailingDistance,
          }
        case 'update-min-sell-price':
          return {
            ...prevState,
            minSellPrice: action.minSellPrice,
          }
        case 'update-max-buy-price':
          return {
            ...prevState,
            maxBuyPrice: action.maxBuyPrice,
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
        case 'update-use-threshold':
          return {
            ...prevState,
            useThreshold: action.useThreshold,
          }
        case 'reset':
          return { ...prevState, ...omniAutomationFormReset }
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
