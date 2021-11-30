import { TxStatus } from '@oasisdex/transactions'
import { approve, ApproveData } from 'blockchain/calls/erc20'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { TxHelpers } from 'components/AppContext'
import { transactionToX } from 'helpers/form'
import { of } from 'rxjs'

import { AllowanceChanges, StateDependencies } from './allowance'

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
