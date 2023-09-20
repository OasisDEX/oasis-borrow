import type BigNumber from 'bignumber.js'
import type { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { calculateDsrBalance } from './dsrPot'

export function createDaiDeposit$(
  chi$: Observable<BigNumber>,
  pie$: Observable<BigNumber>,
): Observable<BigNumber> {
  return combineLatest(pie$, chi$).pipe(
    switchMap(([pie, chi]) => of(calculateDsrBalance({ pie, chi }))),
  )
}
