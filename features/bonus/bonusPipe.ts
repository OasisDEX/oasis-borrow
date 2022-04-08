import { combineLatest, Observable, of, Subject } from 'rxjs'
import BigNumber from 'bignumber.js'
import { map, startWith, switchMap } from 'rxjs/operators'
import { TxState, TxStatus } from '@oasisdex/transactions'

export enum ClaimTxnState {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  SUCCEEDED = 'SUCCEEDED',
}

type Bonus = { amount: BigNumber; symbol: string }

type BonusViewModel = {
  bonuses: Array<Bonus>
  claimAll?: () => void
  claimTxnState?: ClaimTxnState
}

type ClaimCropData = {
  kind: 'ClaimCrop'
}

export function createBonusPipe$(
  vaultResolver$: (cdpId: BigNumber) => Observable<{ urnAddress: string; ilk: string }>,
  cropperCrops$: (args: { ilk: string; usr: string }) => Observable<BigNumber>,
  cropperBonusTokenAddress$: (args: { ilk: string }) => Observable<string>,
  tokenDecimals$: (address: string) => Observable<BigNumber>,
  tokenSymbol$: (address: string) => Observable<string>,
  sendCrop$: (ilk: string, cdpId: BigNumber) => Observable<ClaimTxnState>,
  cdpId: BigNumber,
): Observable<BonusViewModel> {
  const vault$ = vaultResolver$(cdpId)

  const bonuses$: Observable<Array<Bonus>> = vault$.pipe(
    switchMap(({ ilk, urnAddress }) => {
      return combineLatest(
        cropperCrops$({ ilk, usr: urnAddress }),
        cropperBonusTokenAddress$({ ilk }),
      ).pipe(
        switchMap(([bonusValue, bonusAddress]) => {
          if (bonusValue.gt(0)) {
            return combineLatest(tokenDecimals$(bonusAddress), tokenSymbol$(bonusAddress)).pipe(
              map(([bonusDecimals, bonusTokenSymbol]) => {
                return [
                  {
                    amount: bonusValue.div(new BigNumber(10).pow(bonusDecimals)),
                    symbol: bonusTokenSymbol,
                  },
                ]
              }),
            )
          } else {
            return of([])
          }
        }),
      )
    }),
  )

  const claimClick$ = new Subject<void>()

  const claimTnxState$: Observable<ClaimTxnState | undefined> = combineLatest(
    claimClick$,
    vault$,
  ).pipe(
    switchMap(([, { ilk }]) => {
      return sendCrop$(ilk, cdpId)
    }),
    startWith(undefined),
  )

  const claimTxnInProgress$ = claimTnxState$.pipe(
    map((claimTxnState) => claimTxnState !== undefined),
  )

  function claimAllFun() {
    claimClick$.next()
  }

  const claimAllFun$: Observable<(() => void) | undefined> = combineLatest(
    bonuses$,
    claimTxnInProgress$,
  ).pipe(
    map(([bonuses, claimTxnInProgress]) =>
      bonuses.length > 0 && !claimTxnInProgress ? claimAllFun : undefined,
    ),
  )

  return combineLatest(bonuses$, claimAllFun$, claimTnxState$).pipe(
    map(([bonuses, claimAllFunction, claimTxnState]) => ({
      bonuses,
      claimAll: claimAllFunction,
      claimTxnState,
    })),
  )
}
