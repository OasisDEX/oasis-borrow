import { Reducer, useReducer } from 'react'

interface UpdateAnyAction<S> {
  type: 'update-any'
  state: Partial<S>
}
interface useStateReducerProps<S, R> {
  defaults: S
  reducer: Reducer<S, R>
}

export function useStateReducer<S, R>({
  defaults,
  reducer,
}: useStateReducerProps<S, R | UpdateAnyAction<S>>) {
  const [state, dispatch] = useReducer(reducer, defaults)

  function updateState<K extends keyof S, V extends S[K]>(key: K, value: V) {
    dispatch({
      type: 'update-any',
      state: {
        ...state,
        [key]: value,
      },
    })
  }

  return {
    dispatch,
    state,
    updateState,
  }
}

interface ExampleState {
  foo: string
  inc: number
}

interface ExamapleActionIncrement {
  type: 'increment'
}
interface ExamapleActionRename {
  type: 'rename'
  foo: string
}
type ExampleAction<S> = ExamapleActionIncrement | ExamapleActionRename | UpdateAnyAction<S>

function reducer<S>(state: ExampleState, action: ExampleAction<S>) {
  switch (action.type) {
    case 'increment':
      return { ...state, inc: state.inc + 1 }
    case 'rename':
      return { ...state, foo: action.foo }
    case 'update-any':
      return { ...state, ...action.state }
    default:
      return state
  }
}

export function useExampleState() {
  return useStateReducer<ExampleState, ExampleAction<ExampleState>>({
    defaults: { foo: 'bar', inc: 10 },
    reducer,
  })
}
