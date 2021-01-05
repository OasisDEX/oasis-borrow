import { concat, Observable, of } from 'rxjs'
import { catchError, first, map, skip, startWith } from 'rxjs/operators'

export type LoadableStatus = 'loading' | 'loaded' | 'error'

export interface Loadable<T> {
  status: LoadableStatus
  value?: T
  error?: Error
}

export function loadablifyLight<T>(
  observable: Observable<T>,
  onEveryBlock$: Observable<number>,
): Observable<Loadable<T>> {
  return observable.pipe(
    map((value) => ({ value, status: 'loaded' })),
    startWith({ status: 'loading' } as Loadable<T>),
    catchError((error, source) => {
      console.log(error)
      return concat(of({ error, status: 'error' }), onEveryBlock$.pipe(skip(1), first()), source)
    }),
  )
}
