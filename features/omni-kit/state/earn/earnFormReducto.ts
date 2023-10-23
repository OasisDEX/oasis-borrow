import type { OmniEarnFormAction, OmniEarnFormState } from 'features/omni-kit/state/earn'
import { omniEarnFormDefault, omniEarnFormReset } from 'features/omni-kit/state/earn'
import { useReducto } from 'helpers/useReducto'

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
          return { ...state, ...omniEarnFormReset }
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
