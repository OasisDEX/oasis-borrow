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
  createBonusAdapter: (cdpId: BigNumber) => BonusAdapter,
  cdpId: BigNumber,
): Observable<BonusViewModel> {
  const bonusAdapter = createBonusAdapter(cdpId)
  const claimClick$ = new Subject<void>()

  const ClaimTxnState$: Observable<ClaimTxnState | undefined> = combineLatest(
    claimClick$,
    bonusAdapter.claimAll$,
  ).pipe(
    map(([_, claimAll]) => claimAll),
    switchMap((claimAll) => {
      return claimAll ? claimAll() : of(undefined)
    }),
    share(),
    startWith(undefined),
  )

  const claimTxnInProgress$ = ClaimTxnState$.pipe(
    map((claimTxnState) => claimTxnState === ClaimTxnState.PENDING),
  )

  function claimAllFunction() {
    claimClick$.next()
  }

  const claimAll$: Observable<(() => void) | undefined> = combineLatest(
    bonusAdapter.bonus$,
    claimTxnInProgress$,
    bonusAdapter.claimAll$,
  ).pipe(
    map(([bonus, claimTxnInProgress, claimAll]) =>
      bonus && bonus.amountToClaim.gt(zero) && !claimTxnInProgress && !!claimAll
        ? claimAllFunction
        : undefined,
    ),
  )

  return combineLatest(bonusAdapter.bonus$, claimAll$, ClaimTxnState$).pipe(
    map(([bonus, claimAll, claimTxnState]) => ({
      bonus,
      claimAll,
      claimTxnState,
    })),
  )
}
