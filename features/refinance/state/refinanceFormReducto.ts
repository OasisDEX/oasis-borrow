import {
  refinanceFormDefault,
  refinanceFormReset,
} from 'features/refinance/state/refinanceFormReducto.constants'
import type {
  RefinanceFormActions,
  RefinanceFormState,
} from 'features/refinance/state/refinanceFormReducto.types'
import { useReducto } from 'helpers/useReducto'

export function useRefinanceFormReducto({ ...rest }: Partial<RefinanceFormState>) {
  const { dispatch, state, updateState } = useReducto<RefinanceFormState, RefinanceFormActions>({
    defaults: {
      ...refinanceFormDefault,
      ...rest,
    },
    reducer: (prevState: RefinanceFormState, action: RefinanceFormActions) => {
      switch (action.type) {
        case 'reset':
          return { ...prevState, ...refinanceFormReset, ...rest }
        default:
          return prevState
      }
    },
  })

  return {
    dispatch,
    state,
    updateState,
  }
}
