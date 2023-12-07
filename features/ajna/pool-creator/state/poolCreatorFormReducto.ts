import type BigNumber from 'bignumber.js'
import { DEFAULT_POOL_INTEREST_RATE } from 'features/ajna/pool-creator/constants'
import type { FormActionsReset } from 'features/omni-kit/state'
import type { ReductoActions } from 'helpers/useReducto'
import { useReducto } from 'helpers/useReducto'

interface PoolCreatorFormState {
  collateralAddress: string
  interestRate: BigNumber
  quoteAddress: string
}

type PoolCreatorFormAction = ReductoActions<PoolCreatorFormState, FormActionsReset>

export const poolCreatorDefaultState = {
  collateralAddress: '',
  interestRate: DEFAULT_POOL_INTEREST_RATE,
  quoteAddress: '',
}

export function usePoolCreatorFormReducto(defaults: PoolCreatorFormState) {
  const { dispatch, state, updateState } = useReducto<PoolCreatorFormState, PoolCreatorFormAction>({
    defaults,
    reducer: (_state: PoolCreatorFormState, action: PoolCreatorFormAction) => {
      switch (action.type) {
        case 'reset':
          return { ..._state, ...poolCreatorDefaultState }
        default:
          return _state
      }
    },
  })

  return {
    dispatch,
    state,
    updateState,
  }
}
