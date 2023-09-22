import BigNumber from 'bignumber.js'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { RAY, WAD } from 'components/constants'
import type { DsrExitAllData, DsrExitData, DsrJoinData } from 'features/dsr/helpers/potCalls'
import {
  exit,
  exitAll,
  join,
  savingsDaiConvert,
  savingsDaiDeposit,
} from 'features/dsr/helpers/potCalls'
import type { DsrWithdrawChange } from 'features/dsr/pipes/dsrWithdraw'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { transactionToX } from 'helpers/form'
import { roundDown, roundHalfUp } from 'helpers/rounding'
import { zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'
import { first, switchMap } from 'rxjs/operators'

import type { DsrCreationChange, DsrDepositState } from './dsrDeposit.types'

export function depositDsr(
  txHelpers$: Observable<TxHelpers>,
  change: (ch: DsrCreationChange) => void,
  {
    amount,
    proxyAddress,
    allowance,
    isMintingSDai,
    walletAddress,
    daiWalletAllowance,
  }: DsrDepositState,
) {
  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation }) => {
        const callData = isMintingSDai ? savingsDaiDeposit : join
        const txData = isMintingSDai
          ? {
              kind: TxMetaKind.savingsDaiDeposit,
              walletAddress,
              amount: amount!,
            }
          : {
              kind: TxMetaKind.dsrJoin,
              proxyAddress,
              amount: amount!,
            }

        return sendWithGasEstimation(callData as any, txData as any).pipe(
          transactionToX<DsrCreationChange, DsrJoinData>(
            { kind: 'stage', stage: 'depositWaiting4Approval' },
            (txState) =>
              of(
                { kind: 'depositTxHash', depositTxHash: (txState as any).txHash as string },
                { kind: 'stage', stage: 'depositInProgress' },
              ),
            { kind: 'stage', stage: 'depositFiasco' },
            () =>
              of(
                { kind: 'stage', stage: 'depositSuccess' },
                isMintingSDai
                  ? {
                      kind: 'daiWalletAllowance',
                      daiWalletAllowance: daiWalletAllowance?.minus(amount || zero),
                    }
                  : { kind: 'allowance', allowance: allowance?.minus(amount || zero) },
              ),
          ),
        )
      }),
    )
    .subscribe((ch) => change(ch))
}

export function convertDsr(
  txHelpers$: Observable<TxHelpers>,
  change: (ch: DsrCreationChange) => void,
  { amount, allowance, walletAddress, sDaiBalance }: DsrDepositState,
) {
  const resolvedAmount = amount?.gt(sDaiBalance) ? sDaiBalance : amount

  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation }) => {
        return sendWithGasEstimation(
          savingsDaiConvert as any,
          {
            kind: TxMetaKind.savingsDaiConvert,
            walletAddress,
            amount: resolvedAmount!,
          } as any,
        ).pipe(
          transactionToX<DsrCreationChange, DsrJoinData>(
            { kind: 'stage', stage: 'depositWaiting4Approval' },
            (txState) =>
              of(
                { kind: 'depositTxHash', depositTxHash: (txState as any).txHash as string },
                { kind: 'stage', stage: 'depositInProgress' },
              ),
            { kind: 'stage', stage: 'depositFiasco' },
            () =>
              of(
                { kind: 'stage', stage: 'depositSuccess' },
                { kind: 'allowance', allowance: allowance?.minus(amount || zero) },
              ),
          ),
        )
      }),
    )
    .subscribe((ch) => change(ch))
}

function dsrExit(
  txHelpers$: Observable<TxHelpers>,
  change: (ch: DsrWithdrawChange) => void,
  proxyAddress: string,
  amount: BigNumber,
) {
  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation }) =>
        sendWithGasEstimation(
          exit as any,
          {
            kind: TxMetaKind.dsrExit,
            proxyAddress: proxyAddress!,
            amount: amount!,
          } as any,
        ).pipe(
          transactionToX<DsrWithdrawChange, DsrExitData>(
            { kind: 'stage', stage: 'withdrawWaiting4Approval' },
            (txState) =>
              of(
                { kind: 'withdrawTxHash', withdrawTxHash: (txState as any).txHash as string },
                { kind: 'stage', stage: 'withdrawInProgress' },
              ),
            { kind: 'stage', stage: 'withdrawFiasco' },
            () => of({ kind: 'stage', stage: 'withdrawSuccess' }),
          ),
        ),
      ),
    )
    .subscribe((ch) => change(ch))
}
function dsrExitAll(
  txHelpers$: Observable<TxHelpers>,
  change: (ch: DsrWithdrawChange) => void,
  proxyAddress: string,
) {
  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation }) =>
        sendWithGasEstimation(
          exitAll as any,
          {
            kind: TxMetaKind.dsrExitAll,
            proxyAddress: proxyAddress!,
          } as any,
        ).pipe(
          transactionToX<DsrWithdrawChange, DsrExitAllData>(
            { kind: 'stage', stage: 'withdrawWaiting4Approval' },
            (txState) =>
              of(
                { kind: 'withdrawTxHash', withdrawTxHash: (txState as any).txHash as string },
                { kind: 'stage', stage: 'withdrawInProgress' },
              ),
            { kind: 'stage', stage: 'withdrawFiasco' },
            () => of({ kind: 'stage', stage: 'withdrawSuccess' }),
          ),
        ),
      ),
    )
    .subscribe((ch) => change(ch))
}

export function withdrawDsr(
  txHelpers$: Observable<TxHelpers>,
  change: (ch: DsrWithdrawChange) => void,
  state: DsrDepositState,
) {
  const amount = state.amount!
  const proxyAddress = state.proxyAddress!
  const lowerBound = roundDown(state.daiDeposit, 'DAI')
  const upperBound = roundHalfUp(state.daiDeposit, 'DAI')
  const betweenBounds = lowerBound.lt(amount) && upperBound.gte(amount)
  const WEI = new BigNumber(1).div(WAD)
  const zeroDsr = state.potDsr.div(RAY).eq(1)

  if (betweenBounds) {
    if (zeroDsr) {
      return dsrExit(txHelpers$, change, proxyAddress, state.daiDeposit.plus(WEI))
    }
    return dsrExitAll(txHelpers$, change, proxyAddress)
  }
  return dsrExit(txHelpers$, change, proxyAddress, amount)
}
