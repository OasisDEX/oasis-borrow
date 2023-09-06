import BigNumber from 'bignumber.js'
import { calculateDsrBalance } from 'features/dsr/helpers/dsrPot'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export function createDaiDeposit$(
  chi$: Observable<BigNumber>,
  pie$: Observable<BigNumber>,
): Observable<BigNumber> {
  return combineLatest(pie$, chi$).pipe(
    switchMap(([pie, chi]) => of(calculateDsrBalance({ pie, chi }))),
  )
}
