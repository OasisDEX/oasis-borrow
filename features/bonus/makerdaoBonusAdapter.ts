import { TxState, TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { combineLatest, Observable, of } from 'rxjs'
import { filter, map, mapTo, startWith, switchMap, take, tap } from 'rxjs/operators'

import { ClaimRewardData } from '../../blockchain/calls/proxyActions/adapters/ProxyActionsSmartContractAdapterInterface'
import { VaultActionsLogicInterface } from '../../blockchain/calls/proxyActions/vaultActionsLogic'
import { TxMetaKind } from '../../blockchain/calls/txMeta'
import { ContextConnected } from '../../blockchain/network'
import { TxHelpers } from '../../components/AppContext'
import { Bonus, BonusAdapter, ClaimTxnState } from './bonusPipe'

export function createMakerdaoBonusAdapter(
  vaultResolver$: (
    cdpId: BigNumber,
  ) => Observable<{ urnAddress: string; ilk: string; controller: string }>,
  cropperCrops$: (args: { ilk: string; usr: string }) => Observable<BigNumber>,
  cropperBonusTokenAddress$: (args: { ilk: string }) => Observable<string>,
  tokenDecimals$: (address: string) => Observable<BigNumber>,
  tokenSymbol$: (address: string) => Observable<string>,
  tokenName$: (address: string) => Observable<string>,
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  vaultActions: VaultActionsLogicInterface,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  cdpId: BigNumber,
): BonusAdapter {
  const vault$ = vaultResolver$(cdpId).pipe(take(1))

  const bonus$: Observable<Bonus | undefined> = vault$.pipe(
    switchMap(({ ilk, urnAddress }) => {
      return combineLatest(
        cropperCrops$({ ilk, usr: urnAddress }),
        cropperBonusTokenAddress$({ ilk }),
      )
    }),
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

  function claimAll(): Observable<ClaimTxnState> {
    return combineLatest(txHelpers$, context$, vault$).pipe(
      switchMap(([{ sendWithGasEstimation }, context, { ilk }]) => {
        return proxyAddress$(context.account).pipe(
          switchMap((proxyAddress) => {
            return sendWithGasEstimation(vaultActions.claimReward, {
              kind: TxMetaKind.claimReward,
              proxyAddress: proxyAddress!,
              gemJoinAddress: context.joins[ilk],
              cdpId,
            })
          }),
          map(
            (txnState: TxState<ClaimRewardData>): ClaimTxnState => {
              switch (txnState.status) {
                case TxStatus.CancelledByTheUser:
                case TxStatus.Failure:
                case TxStatus.Error:
                  return ClaimTxnState.FAILED
                case TxStatus.Propagating:
                case TxStatus.WaitingForConfirmation:
                case TxStatus.WaitingForApproval:
                case undefined:
                  return ClaimTxnState.PENDING
                case TxStatus.Success:
                  return ClaimTxnState.SUCCEEDED
              }
            },
          ),
        )
      }),
    )
  }

  const context$$ = context$.pipe(startWith(undefined))

  const claimAll$: Observable<(() => Observable<ClaimTxnState>) | undefined> = combineLatest(
    context$.pipe(startWith(undefined)),
    vault$,
  ).pipe(
    map(([context, vault]) => {
      return context && context.account === vault.controller ? claimAll : undefined
    }),
  )

  return {
    bonus$,
    claimAll$,
  }
}
