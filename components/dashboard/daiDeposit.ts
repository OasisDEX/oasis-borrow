import BigNumber from 'bignumber.js'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { calculateDsrBalance } from './dsrPot/dsrPot'

export function createDaiDeposit$(
  chi$: Observable<BigNumber>,
  pie$: Observable<BigNumber>,
): Observable<BigNumber> {
  return combineLatest(pie$, chi$).pipe(
    switchMap(([pie, chi]) => of(calculateDsrBalance({ pie, chi }))),
  )
}
