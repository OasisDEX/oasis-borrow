import {
  omniBorrowFormDefault,
  omniBorrowFormReset,
} from 'features/omni-kit/state/borrow/borrowFormReducto.constants'
import { useReducto } from 'helpers/useReducto'

import type { OmniBorrowFormAction, OmniBorrowFormState } from './borrowFormReducto.types'

export function useOmniBorrowFormReducto({ ...rest }: Partial<OmniBorrowFormState>) {
  const { dispatch, state, updateState } = useReducto<OmniBorrowFormState, OmniBorrowFormAction>({
    defaults: {
      ...omniBorrowFormDefault,
      ...rest,
    },
    reducer: (state: OmniBorrowFormState, action: OmniBorrowFormAction) => {
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
