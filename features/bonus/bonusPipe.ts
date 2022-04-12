import { combineLatest, Observable, of, Subject } from 'rxjs'
import BigNumber from 'bignumber.js'
import { map, share, startWith, switchMap } from 'rxjs/operators'
import { zero } from '../../helpers/zero'

export enum ClaimTxnState {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  SUCCEEDED = 'SUCCEEDED',
}

export type Bonus = { amountToClaim: BigNumber; symbol: string; name: string; moreInfoLink: string }

export type BonusViewModel = {
  bonus?: Bonus // if undefined this CDP does not support rewards
  claimAll?: () => void
  claimTxnState?: ClaimTxnState
}

type ClaimCropData = {
  kind: 'ClaimCrop'
}

export type BonusAdapter = {
  bonus$: Observable<Bonus | undefined>
  claimAll: (() => Observable<ClaimTxnState>) | undefined
}

export function createBonusPipe$(
  bonusAdapter: (cdpId: BigNumber) => BonusAdapter,
  cdpId: BigNumber,
): Observable<BonusViewModel> {
  const { bonus$, claimAll } = bonusAdapter(cdpId)

  const claimClick$ = new Subject<void>()

  const claimTnxState$: Observable<ClaimTxnState | undefined> = claimClick$.pipe(
    switchMap(() => {
      return claimAll ? claimAll() : of(undefined)
    }),
    share(),
    startWith(undefined),
  )

  const claimTxnInProgress$ = claimTnxState$.pipe(
    map((claimTxnState) => claimTxnState !== undefined),
  )

  function claimAllFun() {
    claimClick$.next()
  }

  const claimAllFun$: Observable<(() => void) | undefined> = combineLatest(
    bonus$,
    claimTxnInProgress$,
  ).pipe(
    map(([bonus, claimTxnInProgress]) =>
      bonus && bonus.amountToClaim.gt(zero) && !claimTxnInProgress ? claimAllFun : undefined,
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
