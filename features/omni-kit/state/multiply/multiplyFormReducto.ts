import {
  omniMultiplyFormDefault,
  omniMultiplyFormReset,
} from 'features/omni-kit/state/multiply/multiplyFormReducto.constants'
import { useReducto } from 'helpers/useReducto'

import type { OmniMultiplyFormAction, OmniMultiplyFormState } from './multiplyFormReducto.types'

export function useOmniMultiplyFormReducto({ ...rest }: Partial<OmniMultiplyFormState>) {
  const { dispatch, state, updateState } = useReducto<
    OmniMultiplyFormState,
    OmniMultiplyFormAction
  >({
    defaults: {
      ...omniMultiplyFormDefault,
      ...rest,
    },
    reducer: (state: OmniMultiplyFormState, action: OmniMultiplyFormAction) => {
      switch (action.type) {
        case 'update-deposit':
          return {
            ...state,
            depositAmount: action.depositAmount,
            depositAmountUSD: action.depositAmountUSD,
            loanToValue: undefined,
          }
        case 'update-generate':
          return {
            ...state,
            generateAmount: action.generateAmount,
            generateAmountUSD: action.generateAmountUSD,
          }
        case 'update-payback':
          return {
            ...state,
            paybackAmount: action.paybackAmount,
            paybackAmountUSD: action.paybackAmountUSD,
          }
        case 'update-payback-max':
          return {
            ...state,
            paybackAmountMax: action.paybackAmountMax,
          }
        case 'update-withdraw':
          return {
            ...state,
            withdrawAmount: action.withdrawAmount,
            withdrawAmountUSD: action.withdrawAmountUSD,
          }
        case 'update-dpm':
          return {
            ...state,
            dpmAddress: action.dpmAddress,
          }
        case 'reset':
          return {
            ...state,
            ...omniMultiplyFormReset,
          }
        case 'update-loan-to-value':
          return {
            ...state,
            loanToValue: action.loanToValue,
          }
        default:
          return state
      }
    },
  })

  return {
    dispatch,
    state,
    updateState,
  }
}
