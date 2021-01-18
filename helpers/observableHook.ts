import { useEffect, useState } from 'react'
import { Observable } from 'rxjs'

type Unpack<T extends Observable<any>> = T extends Observable<infer U> ? U : never; 

export function useObservable<O extends Observable<any>>(o$: O): Unpack<O> | undefined {
  const [value, setValue] = useState<Unpack<O> | undefined>(undefined)

  useEffect(() => {
    const subscription = o$.subscribe((v: Unpack<O>) => {
      setValue(v)
    })
    return () => subscription.unsubscribe()
  }, [])

  return value
}
