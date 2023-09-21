import { captureException } from '@sentry/react'
import { useEffect, useState } from 'react'
import type { Observable } from 'rxjs'

export type Unpack<T extends Observable<any>> = T extends Observable<infer U> ? U : never

function raiseObservableErrorInSentry(e: any) {
  if (e instanceof Error) {
    captureException(e)
  } else {
    captureException(new Error(JSON.stringify(e)))
  }
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
