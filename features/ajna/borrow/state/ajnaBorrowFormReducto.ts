import BigNumber from 'bignumber.js'
import { ReductoActions, useReducto } from 'helpers/useReducto'

export interface AjnaProductFormState {
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
  AjnaProductFormState,
  AjnaBorrowFormActionsUpdateDeposit | AjnaBorrowFormActionsUpdateGenerate
>

export function useAjnaBorrowFormReducto({ ...rest }: Partial<AjnaProductFormState>) {
  const { dispatch, state, updateState } = useReducto<AjnaProductFormState, AjnaBorrowFormAction>({
    defaults: {
      depositAmount: undefined,
      depositAmountUSD: undefined,
      generateAmount: undefined,
      generateAmountUSD: undefined,
      ...rest,
    },
    reducer: (state: AjnaProductFormState, action: AjnaBorrowFormAction) => {
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
