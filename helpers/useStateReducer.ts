import { Reducer, useReducer } from 'react'

interface PartialUpdateAction<S> {
  type: 'partial-update'
  state: Partial<S>
}
export type ReductoActions<S, A> = PartialUpdateAction<S> | A

interface ReductoProps<S, R> {
  defaults: S
  reducer: Reducer<S, R>
}

export function useReducto<S, R>({
  defaults,
  reducer,
}: ReductoProps<S, R | PartialUpdateAction<S>>) {
  function combinedReducer(state: S, action: R | PartialUpdateAction<S>) {
    return 'type' in action && action.type === 'partial-update'
      ? { ...state, ...action.state }
      : reducer(state, action)
  }

  function updateState<K extends keyof S, V extends S[K]>(key: K, value: V) {
    dispatch({ type: 'partial-update', state: { ...state, [key]: value } })
  }

  const [state, dispatch] = useReducer(combinedReducer, defaults)

  return { dispatch, state, updateState }
}
