import { multiplyFormDefault, multiplyReset } from 'features/ajna/positions/multiply/state/multiplyFormReducto.constants'
import type { MultiplyFormAction, MultiplyFormState } from 'features/ajna/positions/multiply/state/multiplyFormReducto.types'
import { useReducto } from 'helpers/useReducto'

export function useMultiplyFormReducto({ ...rest }: Partial<MultiplyFormState>) {
  const { dispatch, state, updateState } = useReducto<
    MultiplyFormState,
    MultiplyFormAction
  >({
    defaults: {
      ...multiplyFormDefault,
      ...rest,
    },
    reducer: (state: MultiplyFormState, action: MultiplyFormAction) => {
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
            ...multiplyReset,
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
