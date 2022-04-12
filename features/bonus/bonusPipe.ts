import { combineLatest, Observable, of, Subject } from 'rxjs'
import BigNumber from 'bignumber.js'
import { distinctUntilChanged, map, startWith, switchMap, take, tap } from 'rxjs/operators'
import { TxStatus } from '@oasisdex/transactions'
import { zero } from '../../helpers/zero'
import { ContextConnected } from '../../blockchain/network'
import { TxHelpers } from '../../components/AppContext'
import { VaultActionsLogicInterface } from '../../blockchain/calls/proxyActions/vaultActionsLogic'
import { TxMetaKind } from '../../blockchain/calls/txMeta'

export enum ClaimTxnState {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  SUCCEEDED = 'SUCCEEDED',
}

type Bonus = { amountToClaim: BigNumber; symbol: string; name: string; moreInfoLink: string }

export type BonusViewModel = {
  bonus?: Bonus // if undefined this CDP does not support rewards
  claimAll?: () => void
  claimTxnState?: ClaimTxnState
}

type ClaimCropData = {
  kind: 'ClaimCrop'
}

export function createSendCrop$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  vaultActions: VaultActionsLogicInterface,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  ilk: string,
  cdpId: BigNumber,
): Observable<ClaimTxnState> {
  const thing = combineLatest(txHelpers$, context$).pipe(
    switchMap(([{ sendWithGasEstimation }, context]) => {
      return proxyAddress$(context.account).pipe(
        switchMap((proxyAddress) => {
          return sendWithGasEstimation(vaultActions.claimReward, {
            kind: TxMetaKind.claimReward,
            proxyAddress: proxyAddress!,
            gemJoinAddress: context.joins[ilk],
            cdpId,
          })
        }),
      )
    }),
  )
  return thing.pipe(
    map((txnState) => {
      switch (txnState.status) {
        case TxStatus.CancelledByTheUser:
        case TxStatus.Failure:
        case TxStatus.Error:
          return ClaimTxnState.FAILED
        case TxStatus.Propagating:
        case TxStatus.WaitingForConfirmation:
        case TxStatus.WaitingForApproval:
          return ClaimTxnState.PENDING
        case TxStatus.Success:
          return ClaimTxnState.SUCCEEDED
      }
    }),
  )
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
  const vault$ = vaultResolver$(cdpId).pipe(take(1))

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
