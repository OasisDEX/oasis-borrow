import BigNumber from 'bignumber.js'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { ContextConnected } from './network'

export function getCollateralLocked$(
  context$: Observable<ContextConnected>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  { ilk, token }: { ilk: string; token: string },
): Observable<BigNumber> {
  return context$.pipe(
    switchMap((context) => {
      const address = context.joins[ilk]
      return balance$(token, address)
    }),
  )
}
