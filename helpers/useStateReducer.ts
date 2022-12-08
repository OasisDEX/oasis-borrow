import { Reducer, useReducer } from 'react'

interface UpdateAnyAction<S> {
  type: 'partial-update'
  state: Partial<S>
}
export type StateReducerActions<S, A> = UpdateAnyAction<S> | A

interface StateReducerProps<S, R> {
  defaults: S
  reducer: Reducer<S, R>
}

export function useStateReducer<S, R>({
  defaults,
  reducer,
}: StateReducerProps<S, R | UpdateAnyAction<S>>) {
  function combinedReducer(state: S, action: R | UpdateAnyAction<S>) {
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
