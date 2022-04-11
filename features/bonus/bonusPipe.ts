import { combineLatest, Observable, of, Subject } from 'rxjs'
import BigNumber from 'bignumber.js'
import { map, startWith, switchMap } from 'rxjs/operators'
import { TxState, TxStatus } from '@oasisdex/transactions'
import { zero } from '../../helpers/zero'

export enum ClaimTxnState {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  SUCCEEDED = 'SUCCEEDED',
}

type Bonus = { amountToClaim: BigNumber; symbol: string; name: string; moreInfoLink: string }

type BonusViewModel = {
  bonus?: Bonus // if undefined this CDP does not support rewards
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
  tokenName$: (address: string) => Observable<string>,
  sendCrop$: (ilk: string, cdpId: BigNumber) => Observable<ClaimTxnState>,
  cdpId: BigNumber,
): Observable<BonusViewModel> {
  const vault$ = vaultResolver$(cdpId)

  const bonus$: Observable<Bonus | undefined> = vault$.pipe(
    switchMap(({ ilk, urnAddress }) => {
      return combineLatest(
        cropperCrops$({ ilk, usr: urnAddress }),
        cropperBonusTokenAddress$({ ilk }),
      ).pipe(
        switchMap(([bonusValue, bonusAddress]) => {
          return combineLatest(
            tokenDecimals$(bonusAddress),
            tokenSymbol$(bonusAddress),
            tokenName$(bonusAddress),
          ).pipe(
            map(([bonusDecimals, bonusTokenSymbol, tokenName]) => {
              return {
                amountToClaim: bonusValue.div(new BigNumber(10).pow(bonusDecimals)),
                symbol: bonusTokenSymbol,
                name: tokenName,
                moreInfoLink: 'https://example.com',
              }
            }),
          )
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
