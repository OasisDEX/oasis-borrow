import BigNumber from 'bignumber.js'
import { ReductoActions, useReducto } from 'helpers/useReducto'

export interface AjnaBorrowFormState {
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  generateAmount?: BigNumber
  generateAmountUSD?: BigNumber
}

interface AjnaBorrowFormActionsUpdateDeposit {
  type: 'update-deposit'
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
}
interface AjnaBorrowFormActionsUpdateGenerate {
  type: 'update-generate'
  generateAmount?: BigNumber
  generateAmountUSD?: BigNumber
}

type AjnaBorrowFormAction = ReductoActions<
  AjnaBorrowFormState,
  AjnaBorrowFormActionsUpdateDeposit | AjnaBorrowFormActionsUpdateGenerate
>

export function useAjnaBorrowFormReducto({ ...rest }: Partial<AjnaBorrowFormState>) {
  const { dispatch, state, updateState } = useReducto<AjnaBorrowFormState, AjnaBorrowFormAction>({
    defaults: {
      depositAmount: undefined,
      depositAmountUSD: undefined,
      generateAmount: undefined,
      generateAmountUSD: undefined,
      ...rest,
    },
    reducer: (state: AjnaBorrowFormState, action: AjnaBorrowFormAction) => {
      switch (action.type) {
        case 'update-deposit':
          return {
            ...state,
            depositAmount: action.depositAmount,
            depositAmountUSD: action.depositAmountUSD,
          }
        case 'update-generate':
          return {
            ...state,
            generateAmount: action.generateAmount,
            generateAmountUSD: action.generateAmountUSD,
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
