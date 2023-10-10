import { NetworkIds } from 'blockchain/networks'
import { isEqual, memoize } from 'lodash'
import type { Observable } from 'rxjs'
import { EMPTY } from 'rxjs'
import { catchError, distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

export function defaultResolver<Args>(args: Args): string {
  return JSON.stringify(args)
}

export function defaultParametersResolver(...args: unknown[]): string {
  return JSON.stringify(args)
}

export function makeObservable<Args, Result>(
  refreshTrigger$: Observable<unknown>,
  valueGetter: (args: Args) => Result | Promise<Result>,
  resolver: (args: Args) => string = defaultResolver,
): (a: Args) => Observable<Result> {
  return memoize((args) => {
    return refreshTrigger$.pipe(
      switchMap(async () => await valueGetter(args)),
      distinctUntilChanged((a, b) => isEqual(a, b)),
      shareReplay(1),
    )
  }, resolver)
}

export function makeObservableForNetworkId<Args extends { networkId: NetworkIds }, Result>(
  refreshTrigger$: Observable<unknown>,
  valueGetter: (args: Args) => Result | Promise<Result>,
  networkId: NetworkIds = NetworkIds.MAINNET,
  pipeName: string = '',
  resolver: (args: Args) => string = defaultResolver,
): (a: Omit<Args, 'networkId'>) => Observable<Result> {
  return memoize((args) => {
    if (!args) {
      throw new Error('args is undefined')
    }
    const actualArgs = <Args>{
      ...args,
      networkId: networkId,
    }
    return refreshTrigger$.pipe(
      switchMap(async () => await valueGetter(actualArgs)),
      distinctUntilChanged((a, b) => isEqual(a, b)),
      shareReplay(1),
      catchError((error) => {
        console.error(
          `Error getting value for Args ${JSON.stringify(actualArgs)}. For pipe: ${pipeName}`,
          error,
        )
        return EMPTY
      }),
    )
  }, resolver)
}

export function makeOneObservable<Result>(
  refreshTrigger$: Observable<unknown>,
  valueGetter: () => Result | Promise<Result>,
): Observable<Result> {
  return refreshTrigger$.pipe(
    switchMap(async () => await valueGetter()),
    distinctUntilChanged((a, b) => isEqual(a, b)),
    shareReplay(1),
  )
}
