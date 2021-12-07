import { MemoizedFunction } from 'lodash'
import { Observable } from 'rxjs'
import { useObservable } from './observableHook'

export function usePresenter<T, U>(
  source$: Observable<T>,
  transform: ((source$: Observable<T>) => Observable<U>) & MemoizedFunction,
): U | undefined {
  const viewData$: Observable<U> = transform(source$)
  return useObservable(viewData$)
}
