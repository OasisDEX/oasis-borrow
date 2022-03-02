import * as Sentry from '@sentry/nextjs'
import { useAppContext } from 'components/AppContextProvider'
import { useEffect, useReducer, useState } from 'react'
import { Observable } from 'rxjs'

export type Unpack<T extends Observable<any>> = T extends Observable<infer U> ? U : never

function raiseObservableErrorInSentry(e: any) {
  if (e instanceof Error) {
    Sentry.captureException(e)
  } else {
    Sentry.captureException(new Error(JSON.stringify(e)))
  }
}

export function useUIChanges<S, A>(
  handler: (state: S, action: A) => S,
  initial: S,
  uiSubjectName: string,
): React.Dispatch<A> {
  const { uiChanges } = useAppContext()

  function publishUIChange<T>(props: T) {
    uiChanges.publish<T>(uiSubjectName, props)
  }

  const [uiState, dispatch] = useReducer(handler, initial)
  useEffect(() => {
    publishUIChange(uiState)
  }, [uiState])
  return dispatch
}

export function useObservable<O extends Observable<any>>(o$: O): [Unpack<O> | undefined, any] {
  const [value, setValue] = useState<Unpack<O> | undefined>(undefined)
  const [error, setError] = useState<any>(undefined)

  useEffect(() => {
    const subscription = o$.subscribe(
      (v: Unpack<O>) => setValue(v),
      (e) => {
        setError(e)
        raiseObservableErrorInSentry(e)
      },
    )
    return () => subscription.unsubscribe()
  }, [o$])

  return [value, error]
}
