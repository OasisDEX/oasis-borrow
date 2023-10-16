import { borrowFormDefault, borrowFormReset } from 'features/ajna/positions/borrow/state/borrowFormReducto.constants'
import type { BorrowFormAction, BorrowFormState } from 'features/ajna/positions/borrow/state/borrowFormReducto.types'
import { useReducto } from 'helpers/useReducto'

export function useBorrowFormReducto({ ...rest }: Partial<BorrowFormState>) {
  const { dispatch, state, updateState } = useReducto<BorrowFormState, BorrowFormAction>({
    defaults: {
      ...borrowFormDefault,
      ...rest,
    },
    reducer: (state: BorrowFormState, action: BorrowFormAction) => {
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
        case 'update-dpm':
          return {
            ...state,
            dpmAddress: action.dpmAddress,
          }
        case 'reset':
          return { ...state, ...borrowFormReset }
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
