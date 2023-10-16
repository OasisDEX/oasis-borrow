import { useReducto } from 'helpers/useReducto'

import { omniEarnFormDefault, omniEarnFormReset } from './earnFormReducto.constants'
import type { OmniEarnFormAction,OmniEarnFormState } from './earnFormReducto.types'

export function useOmniEarnFormReducto({ ...rest }: Partial<OmniEarnFormState>) {
  const { dispatch, state, updateState } = useReducto<OmniEarnFormState, OmniEarnFormAction>({
    defaults: {
      ...omniEarnFormDefault,
      ...rest,
    },
    reducer: (state: OmniEarnFormState, action: OmniEarnFormAction) => {
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
          return { ...state, ...omniEarnFormReset, price: rest.price }
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
