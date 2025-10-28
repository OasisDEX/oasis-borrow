import { useEffect, useState } from 'react'
import type { Observable } from 'rxjs'

export type Unpack<T extends Observable<any>> = T extends Observable<infer U> ? U : never

export function useObservable<O extends Observable<any>>(o$: O): [Unpack<O> | undefined, any] {
  const [value, setValue] = useState<Unpack<O> | undefined>(undefined)
  const [error, setError] = useState<any>(undefined)

  useEffect(() => {
    const subscription = o$.subscribe(
      (v: Unpack<O>) => setValue(v),
      (e) => {
        setError(e)
      },
    )
    return () => subscription.unsubscribe()
  }, [o$])

  return [value, error]
}
