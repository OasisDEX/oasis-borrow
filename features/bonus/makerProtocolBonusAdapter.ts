import { TxState, TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { combineLatest, Observable, of } from 'rxjs'
import { map, startWith, switchMap, take } from 'rxjs/operators'

import { TokenBalanceRawForJoinArgs } from '../../blockchain/calls/erc20'
import { ClaimRewardData } from '../../blockchain/calls/proxyActions/adapters/ProxyActionsSmartContractAdapterInterface'
import { VaultActionsLogicInterface } from '../../blockchain/calls/proxyActions/vaultActionsLogic'
import { TxMetaKind } from '../../blockchain/calls/txMeta'
import { ContextConnected } from '../../blockchain/network'
import { amountFromPrecision, amountFromRay, amountToRay } from '../../blockchain/utils'
import { TxHelpers } from '../../components/AppContext'
import { zero } from '../../helpers/zero'
import { Bonus, BonusAdapter, ClaimTxnState } from './bonusPipe'

function calculateUnclaimedBonusAmount({
  unclaimedInCurve,
  erc20Balance,
  stock,
  share,
  total,
  stake,
  crops,
  bonusDecimals,
}: {
  unclaimedInCurve: BigNumber // token precision
  erc20Balance: BigNumber // token precision (18 - wad)
  stock: BigNumber // token precision (18 - wad)
  share: BigNumber // [bonus decimals * ray / wad] === ray
  total: BigNumber // total gems       [wad]
  stake: BigNumber // gems per user   [wad]
  crops: BigNumber // crops per user  [bonus decimals]
  bonusDecimals: BigNumber
}) {
  const potentialCrop = unclaimedInCurve.plus(erc20Balance).minus(stock) // token precision
  const potentialShare = share.plus(amountToRay(potentialCrop).div(total))
  const potentialCurr = amountFromRay(stake.times(potentialShare))
  const potentialBonusBonusPrecision = potentialCurr.minus(crops) // bonus precision
  const unclaimedBonus = amountFromPrecision(potentialBonusBonusPrecision, bonusDecimals)
  return unclaimedBonus.lt(zero) ? zero : unclaimedBonus
}

type CropperCalls = {
  stake$: (args: { ilk: string; usr: string }) => Observable<BigNumber>
  share$: (args: { ilk: string }) => Observable<BigNumber>
  bonusTokenAddress$: (args: { ilk: string }) => Observable<string>
  stock$: (args: { ilk: string }) => Observable<BigNumber>
  total$: (args: { ilk: string }) => Observable<BigNumber>
  crops$: (args: { ilk: string; usr: string }) => Observable<BigNumber>
}

type Erc20Calls = {
  tokenDecimals$: (address: string) => Observable<BigNumber>
  tokenSymbol$: (address: string) => Observable<string>
  tokenName$: (address: string) => Observable<string>
  tokenBalanceRawForJoin$: (args: TokenBalanceRawForJoinArgs) => Observable<BigNumber>
}

export function createMakerProtocolBonusAdapter(
  vaultResolver$: (
    cdpId: BigNumber,
  ) => Observable<{ urnAddress: string; ilk: string; controller: string }>,
  unclaimedInCrv$: (args: string) => Observable<BigNumber>,
  cropperCalls: CropperCalls,
  erc20Calls: Erc20Calls,
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  vaultActions: VaultActionsLogicInterface,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  cdpId: BigNumber,
): BonusAdapter {
  const { stake$, share$, bonusTokenAddress$, stock$, total$, crops$ } = cropperCalls
  const { tokenDecimals$, tokenSymbol$, tokenName$, tokenBalanceRawForJoin$ } = erc20Calls

  const vault$ = vaultResolver$(cdpId).pipe(take(1))

  const bonus$: Observable<Bonus> = vault$.pipe(
    // read how much bonus the user has in maker
    switchMap(({ ilk, urnAddress }) => {
      return combineLatest(
        combineLatest(
          stake$({ ilk, usr: urnAddress }),
          share$({ ilk }),
          bonusTokenAddress$({ ilk }),
          stock$({ ilk }),
          total$({ ilk }),
          crops$({ ilk, usr: urnAddress }),
        ),
        unclaimedInCrv$(ilk),
        of(ilk),
      )
    }),
    // get bonus token info
    switchMap(([[stake, share, bonusAddress, stock, total, crops], unclaimedInCurve, ilk]) => {
      return combineLatest(
        combineLatest(
          tokenDecimals$(bonusAddress),
          tokenSymbol$(bonusAddress),
          tokenName$(bonusAddress),
          tokenBalanceRawForJoin$({ tokenAddress: bonusAddress, ilk }),
        ),
        combineLatest(of(stake), of(share), of(stock), of(total), of(crops), of(unclaimedInCurve)),
      )
    }),
    // put it all together
    map(
      ([
        [bonusDecimals, bonusTokenSymbol, tokenName, tokenBalanceRaw],
        [stake, share, stock, total, crops, unclaimedInCurve],
      ]) => {
        return {
          amountToClaim: calculateUnclaimedBonusAmount({
            stake,
            share,
            stock,
            total,
            crops,
            unclaimedInCurve,
            erc20Balance: tokenBalanceRaw,
            bonusDecimals,
          }),
          symbol: bonusTokenSymbol,
          name: tokenName,
          moreInfoLink:
            'https://blog.lido.fi/providing-steth-liquidity-via-curve-to-receive-rewards/',
          get readableAmount() {
            return this.amountToClaim.toFixed(0) + this.symbol
          },
        }
      },
    ),
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
