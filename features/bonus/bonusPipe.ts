import BigNumber from 'bignumber.js'
import { combineLatest, Observable, of, Subject } from 'rxjs'
import { map, share, startWith, switchMap } from 'rxjs/operators'

import { zero } from '../../helpers/zero'

export enum ClaimTxnState {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  SUCCEEDED = 'SUCCEEDED',
}

export type Bonus = {
  amountToClaim: BigNumber
  symbol: string
  name: string
  moreInfoLink: string
  readableAmount: string
}

export type BonusViewModel = {
  bonus: Bonus
  claimAll?: () => void
  claimTxnState?: ClaimTxnState
}

export type BonusAdapter = {
  bonus$: Observable<Bonus>
  claimAll$: Observable<(() => Observable<ClaimTxnState>) | undefined>
}

export function createBonusPipe$(
  bonusAdapter: (cdpId: BigNumber) => BonusAdapter,
  cdpId: BigNumber,
): Observable<BonusViewModel> {
  const { bonus$, claimAll$ } = bonusAdapter(cdpId)
  const claimClick$ = new Subject<void>()

  const claimTnxState$: Observable<ClaimTxnState | undefined> = combineLatest(
    claimClick$,
    claimAll$,
  ).pipe(
    map(([_, claimAll]) => claimAll),
    switchMap((claimAll) => {
      return claimAll ? claimAll() : of(undefined)
    }),
    share(),
    startWith(undefined),
  )

  const claimTxnInProgress$ = claimTnxState$.pipe(
    map((claimTxnState) => claimTxnState === ClaimTxnState.PENDING),
  )

  function claimAllFun() {
    claimClick$.next()
  }

  const claimAllFun$: Observable<(() => void) | undefined> = combineLatest(
    bonus$,
    claimTxnInProgress$,
    claimAll$,
  ).pipe(
    map(([bonus, claimTxnInProgress, claimAll]) =>
      bonus && bonus.amountToClaim.gt(zero) && !claimTxnInProgress && !!claimAll
        ? claimAllFun
        : undefined,
    ),
  )

  return combineLatest(bonus$, claimAllFun$, claimTnxState$).pipe(
    map(([bonus, claimAllFunction, claimTxnState]) => ({
      bonus,
      claimAll: claimAllFunction,
      claimTxnState,
    })),
  )
}
