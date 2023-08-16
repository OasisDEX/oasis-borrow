import BigNumber from 'bignumber.js'
import { ReductoActions, useReducto } from 'helpers/useReducto'

interface PoolCreatorFormState {
  collateralAddress: string
  interestRate: BigNumber
  quoteAddress: string
}

type PoolCreatorFormAction = ReductoActions<PoolCreatorFormState, {}>

export function usePoolCreatorFormReducto(defaults: PoolCreatorFormState) {
  const { dispatch, state, updateState } = useReducto<PoolCreatorFormState, PoolCreatorFormAction>({
    defaults,
    reducer: (state: PoolCreatorFormState) => state,
  })

  return {
    dispatch,
    state,
    updateState,
  }
}
