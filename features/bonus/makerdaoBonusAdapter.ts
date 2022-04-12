import { Bonus, BonusAdapter, ClaimTxnState } from './bonusPipe'
import { map, switchMap, take } from 'rxjs/operators'
import { combineLatest, Observable } from 'rxjs'
import BigNumber from 'bignumber.js'
import { ContextConnected } from '../../blockchain/network'
import { TxHelpers } from '../../components/AppContext'
import { TxMetaKind } from '../../blockchain/calls/txMeta'
import { TxStatus } from '@oasisdex/transactions'
import { VaultActionsLogicInterface } from '../../blockchain/calls/proxyActions/vaultActionsLogicInterface'

export function createMakerdaoBonusAdapter(
  vaultResolver$: (cdpId: BigNumber) => Observable<{ urnAddress: string; ilk: string }>,
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

  const claimAll = (): Observable<ClaimTxnState> => {
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
      }),
    )
  }

  return {
    bonus$,
    claimAll,
  }
}
