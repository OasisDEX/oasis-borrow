import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { reclaim, ReclaimData } from 'blockchain/calls/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { TxHelpers } from 'components/AppContext'
import { transactionToX } from 'helpers/form'
import { of } from 'rxjs'

export type ReclaimChange =
  | { kind: 'reclaimWaitingForApproval' }
  | {
      kind: 'reclaimInProgress'
      manageTxHash: string
    }
  | {
      kind: 'reclaimFailure'
      txError?: any
    }
  | {
      kind: 'reclaimSuccess'
    }

export function reclaimCollateral(
  { send }: TxHelpers,
  proxyAddress: string,
  amount: BigNumber,
  token: string,
  id: BigNumber,
) {
  return send(reclaim, {
    kind: TxMetaKind.reclaim,
    proxyAddress: proxyAddress!,
    amount,
    token,
    id,
  }).pipe(
    transactionToX<ReclaimChange, ReclaimData>(
      { kind: 'reclaimWaitingForApproval' },
      (txState) =>
        of({
          kind: 'reclaimInProgress',
          manageTxHash: (txState as any).txHash as string,
        }),
      (txState) => {
        return of({
          kind: 'reclaimFailure',
          txError:
            txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
              ? txState.error
              : undefined,
        })
      },
      () => of({ kind: 'reclaimSuccess' }),
    ),
  )
}
