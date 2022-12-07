import { Reducer, useReducer } from 'react'

interface UpdateAnyAction<S> {
  type: 'update-any'
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
    return 'type' in action && action.type === 'update-any'
      ? { ...state, ...action.state }
      : reducer(state, action)
  }

  function updateState<K extends keyof S, V extends S[K]>(key: K, value: V) {
    dispatch({
      type: 'update-any',
      state: {
        ...state,
        [key]: value,
      },
    })
  }

  const [state, dispatch] = useReducer(combinedReducer, defaults)

  return { dispatch, state, updateState }
}

interface ExampleState {
  bar: number
  foo: string
}

interface ExamapleActionIncrement {
  type: 'increment'
}
interface ExamapleActionRename {
  type: 'rename'
  renameTo: string
}
type ExampleAction = StateReducerActions<
  ExampleState,
  ExamapleActionIncrement | ExamapleActionRename
>

function exampleReducer(state: ExampleState, action: ExampleAction) {
  switch (action.type) {
    case 'increment':
      return { ...state, bar: state.bar + 1 }
    case 'rename':
      return { ...state, foo: action.renameTo }
    default:
      return state
  }
}

const exampleStateDefaults = { foo: 'test', bar: 0 }

export function useExampleState() {
  const { dispatch, state, updateState } = useStateReducer<ExampleState, ExampleAction>({
    defaults: exampleStateDefaults,
    reducer: exampleReducer,
  })

  return {
    dispatchExampleState: dispatch,
    exampleState: state,
    updateExampleState: updateState,
  }
}
