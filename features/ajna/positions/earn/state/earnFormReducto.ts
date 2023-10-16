import type { EarnFormAction, EarnFormState } from 'features/ajna/positions/earn/state/earnFormReducto.types'
import { useReducto } from 'helpers/useReducto'

import { earnFormDefault, earnFormReset } from './ajnaEarnFormReducto.constants'

export function useEarnFormReducto({ ...rest }: Partial<EarnFormState>) {
  const { dispatch, state, updateState } = useReducto<EarnFormState, EarnFormAction>({
    defaults: {
      ...earnFormDefault,
      ...rest,
    },
    reducer: (state: EarnFormState, action: EarnFormAction) => {
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
          return { ...state, ...earnFormReset, price: rest.price }
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
