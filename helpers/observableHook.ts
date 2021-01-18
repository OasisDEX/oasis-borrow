import { useEffect, useState } from 'react'
import { Observable } from 'rxjs'

// In order to infer proper type of observable returned by curry from ramda which uses recursive typing 
// we need to postpone inference. 
// Type Unpack is used in order to extract inner type of Observable
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
