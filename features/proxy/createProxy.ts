import { TxStatus } from '@oasisdex/transactions'
import { createDsProxy, CreateDsProxyData } from 'blockchain/calls/proxy'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { TxHelpers } from 'components/AppContext'
import { transactionToX } from 'helpers/form'
import { iif, Observable, of } from 'rxjs'
import { filter, switchMap } from 'rxjs/operators'

import { ProxyChanges } from './proxy'

export function createProxy(
  { sendWithGasEstimation }: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: any /* TODO fix changes type */) => void,
  { safeConfirmations }: { safeConfirmations: number },
) {
  sendWithGasEstimation(createDsProxy, { kind: TxMetaKind.createDsProxy })
    .pipe(
      transactionToX<ProxyChanges, CreateDsProxyData>(
        { kind: 'proxyWaitingForApproval' },
        (txState) =>
          of({ kind: 'proxyInProgress', proxyTxHash: (txState as any).txHash as string }),
        (txState) =>
          of({
            kind: 'proxyFailure',
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          }),
        (txState) =>
          proxyAddress$.pipe(
            filter((proxyAddress) => !!proxyAddress),
            switchMap((proxyAddress) =>
              iif(
                () => (txState as any).confirmations < safeConfirmations,
                of({
                  kind: 'proxyConfirming',
                  proxyConfirmations: (txState as any).confirmations,
                }),
                of({ kind: 'proxySuccess', proxyAddress: proxyAddress! }),
              ),
            ),
          ),
        safeConfirmations,
      ),
    )
    .subscribe((ch) => change(ch))
}
