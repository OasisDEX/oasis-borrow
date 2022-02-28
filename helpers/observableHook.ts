import * as Sentry from '@sentry/nextjs'
import { useAppContext } from 'components/AppContextProvider'
import { useEffect, useReducer, useState } from 'react'
import { Observable } from 'rxjs'

export type Unpack<T extends Observable<any>> = T extends Observable<infer U> ? U : never

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
    console.log('New state', uiState)
    publishUIChange(uiState)
  }, [uiState])
  return dispatch
}
// In order to infer proper type of observable returned by curry from ramda which uses recursive typing
// we need to postpone inference.
// Type Unpack is used in order to extract inner type of Observable
export function useObservable<O extends Observable<any>>(o$: O): Unpack<O> | undefined {
  const [value, setValue] = useState<Unpack<O> | undefined>(undefined)

  useEffect(() => {
    const subscription = o$.subscribe(
      (v: Unpack<O>) => setValue(v),
      (error) => {
        console.log('error', error)
        Sentry.captureException(error)
      },
    )
    return () => subscription.unsubscribe()
  }, [o$])

  return value
}

export function useObservableWithError<O extends Observable<any>>(
  o$: O,
): { value: Unpack<O> | undefined; error: any } {
  const [value, setValue] = useState<Unpack<O> | undefined>(undefined)
  const [error, setError] = useState<any>(undefined)

  useEffect(() => {
    const subscription = o$.subscribe(
      (v: Unpack<O>) => setValue(v),
      (e) => {
        setError(e)
        Sentry.captureException(e)
      },
    )
    return () => subscription.unsubscribe()
  }, [o$])

  return { value, error }
}
