import { useAppContext } from 'components/AppContextProvider'
import { MemoizedFunction } from 'lodash'
import { Observable } from 'rxjs'

import { AppContext } from '../components/AppContext'
import { useObservable } from './observableHook'

export function usePresenter<T, U>(
  getSources: (appContext: AppContext) => T,
  createPresenter: ((sources: T) => Observable<U>) & MemoizedFunction,
): U | undefined {
  const sources: T = getSources(useAppContext())
  const viewData$: Observable<U> = createPresenter(sources)
  return useObservable(viewData$)
}
