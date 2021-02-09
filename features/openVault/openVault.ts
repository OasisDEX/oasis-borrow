import { Context } from 'blockchain/network'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export interface OpenVaultState {
  stage: 'start'
}

export function createOpenVault$(
  context$: Observable<Context>,
  ilks$: Observable<string[]>,
  ilk: string,
): Observable<any> {
  return ilks$.pipe(
    switchMap((ilks) => {
      return of(ilks)
    }),
  )
}
