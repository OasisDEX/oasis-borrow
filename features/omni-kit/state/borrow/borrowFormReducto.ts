import type { OmniBorrowFormActions, OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import { omniBorrowFormDefault, omniBorrowFormReset } from 'features/omni-kit/state/borrow'
import { useReducto } from 'helpers/useReducto'

export function useOmniBorrowFormReducto({ ...rest }: Partial<OmniBorrowFormState>) {
  const { dispatch, state, updateState } = useReducto<OmniBorrowFormState, OmniBorrowFormActions>({
    defaults: {
      ...omniBorrowFormDefault,
      ...rest,
    },
    reducer: (state: OmniBorrowFormState, action: OmniBorrowFormActions) => {
      switch (action.type) {
        case 'update-deposit':
          return {
            ...state,
            depositAmount: action.depositAmount,
            depositAmountUSD: action.depositAmountUSD,
          }
        case 'update-withdraw':
          return {
            ...state,
            withdrawAmount: action.withdrawAmount,
            withdrawAmountUSD: action.withdrawAmountUSD,
          }
        case 'update-withdraw-max':
          return {
            ...state,
            withdrawAmountMax: action.withdrawAmountMax,
          }
        case 'update-generate':
          return {
            ...state,
            generateAmount: action.generateAmount,
            generateAmountUSD: action.generateAmountUSD,
          }
        case 'update-generate-max':
          return {
            ...state,
            generateAmountMax: action.generateAmountMax,
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
        case 'update-dpm':
          return {
            ...state,
            dpmAddress: action.dpmAddress,
          }
        case 'reset':
          return { ...state, ...omniBorrowFormReset }
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
