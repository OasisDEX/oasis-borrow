import { TxStatus } from '@oasisdex/transactions'
import { approve } from 'blockchain/calls/erc20'
import type { ApproveData } from 'blockchain/calls/erc20.types'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { transactionToX } from 'helpers/form'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'
import { first, switchMap } from 'rxjs/operators'

import type { AllowanceChanges, StateDependencies } from './allowance.types'

export function setAllowance(
  { sendWithGasEstimation }: TxHelpers,
  change: (ch: AllowanceChanges) => void,
  state: StateDependencies,
) {
  sendWithGasEstimation(approve, {
    kind: TxMetaKind.approve,
    token: state.token,
    spender: state.proxyAddress!,
    amount: state.allowanceAmount!,
  })
    .pipe(
      transactionToX<AllowanceChanges, ApproveData>(
        { kind: 'allowanceWaitingForApproval' },
        (txState) =>
          of({
            kind: 'allowanceInProgress',
            allowanceTxHash: (txState as any).txHash as string,
          }),
        (txState) =>
          of({
            kind: 'allowanceFailure',
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          }),
        (txState) => of({ kind: 'allowanceSuccess', allowance: txState.meta.amount }),
        //TODO: check if we need confirmations
      ),
    )
    .subscribe((ch) => change(ch))
}

// TODO this one is almost fully duplicated if you compare it with setAllowance from manage
export function setDsrAllowance(
  txHelpers$: Observable<TxHelpers>,
  change: (ch: AllowanceChanges) => void,
  state: StateDependencies & {
    isMintingSDai: boolean
  },
) {
  const {
    tokens: { SDAI },
  } = getNetworkContracts(NetworkIds.MAINNET)

  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation }) =>
        sendWithGasEstimation(approve, {
          kind: TxMetaKind.approve,
          token: state.token,
          spender: state.isMintingSDai ? SDAI.address : state.proxyAddress!,
          amount: state.allowanceAmount!,
        }).pipe(
          transactionToX<AllowanceChanges, ApproveData>(
            { kind: 'allowanceWaitingForApproval' },
            (txState) =>
              of({
                kind: 'allowanceInProgress',
                allowanceTxHash: (txState as any).txHash as string,
              }),
            (txState) =>
              of({
                kind: 'allowanceFailure',
                txError:
                  txState.status === TxStatus.Error ||
                  txState.status === TxStatus.CancelledByTheUser
                    ? txState.error
                    : undefined,
              }),
            (txState) => of({ kind: 'allowanceSuccess', allowance: txState.meta.amount }),
          ),
        ),
      ),
    )
    .subscribe((ch) => change(ch))
}
