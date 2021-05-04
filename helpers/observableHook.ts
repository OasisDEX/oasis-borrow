import { useEffect, useState } from 'react'
import { Observable } from 'rxjs'

type Unpack<T extends Observable<any>> = T extends Observable<infer U> ? U : never

// In order to infer proper type of observable returned by curry from ramda which uses recursive typing
// we need to postpone inference.
// Type Unpack is used in order to extract inner type of Observable
export function useObservable<O extends Observable<any>>(o$: O): Unpack<O> | undefined {
  const [value, setValue] = useState<Unpack<O> | undefined>(undefined)

  useEffect(() => {
    const subscription = o$.subscribe(
      (v: Unpack<O>) => setValue(v),
      (error) => console.log('error', error),
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
      (e) => setError(e),
    )
    return () => subscription.unsubscribe()
  }, [o$])

  return { value, error }
}
