import { useReducto } from 'helpers/useReducto'

import { ajnaEarnDefault, ajnaEarnReset } from './ajnaEarnFormReducto.constants'
import type { AjnaEarnFormAction, AjnaEarnFormState } from './ajnaEarnFormReducto.types'

export function useAjnaEarnFormReducto({ ...rest }: Partial<AjnaEarnFormState>) {
  const { dispatch, state, updateState } = useReducto<AjnaEarnFormState, AjnaEarnFormAction>({
    defaults: {
      ...ajnaEarnDefault,
      ...rest,
    },
    reducer: (state: AjnaEarnFormState, action: AjnaEarnFormAction) => {
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
        case 'update-dpm':
          return {
            ...state,
            dpmAddress: action.dpmAddress,
          }
        case 'reset':
          return { ...state, ...ajnaEarnReset, price: rest.price }
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
