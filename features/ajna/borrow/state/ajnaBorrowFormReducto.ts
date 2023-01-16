import BigNumber from 'bignumber.js'
import { ReductoActions, useReducto } from 'helpers/useReducto'
import { useEffect } from 'react'

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

type AjnaBorrowFormAction = ReductoActions<AjnaProductFormState, AjnaBorrowFormActionsUpdateDeposit>

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
        default:
          return state
      }
    },
  })

  useEffect(() => {
    console.log(`depositAmount: ${state?.depositAmount}`)
    console.log(`depositAmountUSD: ${state?.depositAmountUSD}`)
  }, [state])

  return {
    dispatch,
    state,
    updateState,
  }
}
