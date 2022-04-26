import { TxState, TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { combineLatest, Observable, of } from 'rxjs'
import { map, startWith, switchMap, take } from 'rxjs/operators'

import { ClaimRewardData } from '../../blockchain/calls/proxyActions/adapters/ProxyActionsSmartContractAdapterInterface'
import { VaultActionsLogicInterface } from '../../blockchain/calls/proxyActions/vaultActionsLogic'
import { TxMetaKind } from '../../blockchain/calls/txMeta'
import { ContextConnected } from '../../blockchain/network'
import { TxHelpers } from '../../components/AppContext'
import { RAY } from '../../components/constants'
import { Bonus, BonusAdapter, ClaimTxnState } from './bonusPipe'

// calculateUnclaimedBonusAmount is a first-pass implementation to get the unclaimed bonus amount.
// The value could not be up to date, and the real value will be higher.
// The exact calculation would be something of this sort:

// unclaimedInCurve = pool.earned(address(cropJoin));
// potentialCrop    = unclaimedInCurve + bonus.balanceOf(address(cropJoin)) - cropJoin.stock();
// potentialShare   = add(cropJoin.share(), rdiv(potentialCrop, cropJoin.total()));
// potentialCurr    = rmul(cropJoin.stake(from), potentialShare);
// potentialBonus   = potentialCurr - cropJoin.crops(from);

// (not tested at all, so don't use it without verifying first)

function calculateUnclaimedBonusAmount(
  stake: BigNumber,
  share: BigNumber,
  bonusDecimals: BigNumber,
): BigNumber {
  return stake.times(share).div(RAY).div(new BigNumber(10).pow(bonusDecimals))
}

export function createMakerProtocolBonusAdapter(
  vaultResolver$: (
    cdpId: BigNumber,
  ) => Observable<{ urnAddress: string; ilk: string; controller: string }>,
  cropperStake$: (args: { ilk: string; usr: string }) => Observable<BigNumber>,
  cropperShare$: (args: { ilk: string }) => Observable<BigNumber>,
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
    // read how much bonus the user has in maker
    switchMap(({ ilk, urnAddress }) => {
      return combineLatest(
        cropperStake$({ ilk, usr: urnAddress }),
        cropperShare$({ ilk }),
        cropperBonusTokenAddress$({ ilk }),
      )
    }),
    // get bonus token info
    switchMap(([stake, share, bonusAddress]) => {
      return combineLatest(
        tokenDecimals$(bonusAddress),
        tokenSymbol$(bonusAddress),
        tokenName$(bonusAddress),
        of(stake),
        of(share),
      )
    }),
    // all together now
    map(([bonusDecimals, bonusTokenSymbol, tokenName, stake, share]) => {
      return {
        amountToClaim: calculateUnclaimedBonusAmount(stake, share, bonusDecimals),
        symbol: bonusTokenSymbol,
        name: tokenName,
        moreInfoLink: 'https://example.com',
      }
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

  const claimAll$: Observable<(() => Observable<ClaimTxnState>) | undefined> = combineLatest(
    context$.pipe(startWith<ContextConnected | undefined>(undefined)),
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
