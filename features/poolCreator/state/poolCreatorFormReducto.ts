import type BigNumber from 'bignumber.js'
import type { ReductoActions } from 'helpers/useReducto'
import { useReducto } from 'helpers/useReducto'

interface PoolCreatorFormState {
  collateralAddress: string
  interestRate: BigNumber
  quoteAddress: string
}

type PoolCreatorFormAction = ReductoActions<PoolCreatorFormState, {}>

export function usePoolCreatorFormReducto(defaults: PoolCreatorFormState) {
  const { dispatch, state, updateState } = useReducto<PoolCreatorFormState, PoolCreatorFormAction>({
    defaults,
    reducer: (_state: PoolCreatorFormState) => _state,
  })

  return {
    dispatch,
    state,
    updateState,
  }
}
