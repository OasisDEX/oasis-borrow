import { Observable } from 'rxjs'
import { startWith } from 'rxjs/operators'

export function startWithDefault<T, K>(o$: Observable<T>, defaultValue: K): Observable<T | K> {
  return o$.pipe(startWith<T | K>(defaultValue))
}
