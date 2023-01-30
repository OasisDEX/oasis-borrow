import BigNumber from 'bignumber.js'
import { AjnaBorrowAction } from 'features/ajna/common/types'
import { ReductoActions, useReducto } from 'helpers/useReducto'

export interface AjnaBorrowFormState {
  action?: AjnaBorrowAction
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
interface AjnaBorrowFormActionsReset {
  type: 'reset'
}

type AjnaBorrowFormAction = ReductoActions<
  AjnaBorrowFormState,
  | AjnaBorrowFormActionsUpdateDeposit
  | AjnaBorrowFormActionsUpdateGenerate
  | AjnaBorrowFormActionsReset
>

export const ajnaBorrowDefault: AjnaBorrowFormState = {
  action: undefined,
  depositAmount: undefined,
  depositAmountUSD: undefined,
  generateAmount: undefined,
  generateAmountUSD: undefined,
}

export function useAjnaBorrowFormReducto({ ...rest }: Partial<AjnaBorrowFormState>) {
  const { dispatch, state, updateState } = useReducto<AjnaBorrowFormState, AjnaBorrowFormAction>({
    defaults: {
      ...ajnaBorrowDefault,
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
        case 'reset':
          return ajnaBorrowDefault
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
