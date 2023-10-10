import { useReducto } from 'helpers/useReducto'

import { ajnaMultiplyDefault, ajnaMultiplyReset } from './ajnaMultiplyFormReducto.constants'
import type { AjnaMultiplyFormAction, AjnaMultiplyFormState } from './ajnaMultiplyFormReducto.types'

export function useAjnaMultiplyFormReducto({ ...rest }: Partial<AjnaMultiplyFormState>) {
  const { dispatch, state, updateState } = useReducto<
    AjnaMultiplyFormState,
    AjnaMultiplyFormAction
  >({
    defaults: {
      ...ajnaMultiplyDefault,
      ...rest,
    },
    reducer: (state: AjnaMultiplyFormState, action: AjnaMultiplyFormAction) => {
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
            ...ajnaMultiplyReset,
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
