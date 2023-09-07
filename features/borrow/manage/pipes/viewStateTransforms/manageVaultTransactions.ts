import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { createDsProxy, CreateDsProxyData } from 'blockchain/calls/proxy'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import {
  ManageMultiplyVaultChange,
  ManageMultiplyVaultState,
} from 'features/multiply/manage/pipes/manageMultiplyVault'
import { TxHelpers } from 'helpers/context/types'
import { transactionToX } from 'helpers/form'
import { TxError } from 'helpers/types'
import { iif, Observable, of } from 'rxjs'
import { filter, first, switchMap } from 'rxjs/operators'

type ProxyChange =
  | {
      kind: 'proxyWaitingForApproval'
    }
  | {
      kind: 'proxyInProgress'
      proxyTxHash: string
    }
  | {
      kind: 'proxyFailure'
      txError?: TxError
    }
  | {
      kind: 'proxyConfirming'
      proxyConfirmations?: number
    }
  | {
      kind: 'proxySuccess'
      proxyAddress: string
    }

type CollateralAllowanceChange =
  | { kind: 'collateralAllowanceWaitingForApproval' }
  | {
      kind: 'collateralAllowanceInProgress'
      collateralAllowanceTxHash: string
    }
  | {
      kind: 'collateralAllowanceFailure'
      txError?: TxError
    }
  | {
      kind: 'collateralAllowanceSuccess'
      collateralAllowance: BigNumber
    }

type DaiAllowanceChange =
  | { kind: 'daiAllowanceWaitingForApproval' }
  | {
      kind: 'daiAllowanceInProgress'
      daiAllowanceTxHash: string
    }
  | {
      kind: 'daiAllowanceFailure'
      txError?: TxError
    }
  | {
      kind: 'daiAllowanceSuccess'
      daiAllowance: BigNumber
    }

type ManageChange =
  | { kind: 'manageWaitingForApproval' }
  | {
      kind: 'manageInProgress'
      manageTxHash: string
    }
  | {
      kind: 'manageFailure'
      txError?: TxError
    }
  | {
      kind: 'manageSuccess'
    }

export type ManageVaultTransactionChange =
  | ProxyChange
  | CollateralAllowanceChange
  | DaiAllowanceChange
  | ManageChange

export function createProxy(
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: ManageMultiplyVaultChange) => void,
  { safeConfirmations }: ManageMultiplyVaultState,
) {
  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation }) =>
        sendWithGasEstimation(createDsProxy, { kind: TxMetaKind.createDsProxy }).pipe(
          transactionToX<ManageMultiplyVaultChange, CreateDsProxyData>(
            { kind: 'proxyWaitingForApproval' },
            (txState) =>
              of({
                kind: 'proxyInProgress',
                proxyTxHash: (txState as any).txHash as string,
              }),
            (txState) =>
              of({
                kind: 'proxyFailure',
                txError:
                  txState.status === TxStatus.Error ||
                  txState.status === TxStatus.CancelledByTheUser
                    ? txState.error
                    : undefined,
              }),
            (txState) => {
              return proxyAddress$.pipe(
                filter((proxyAddress) => !!proxyAddress),
                switchMap((proxyAddress) => {
                  return iif(
                    () => (txState as any).confirmations < safeConfirmations,
                    of({
                      kind: 'proxyConfirming',
                      proxyConfirmations: (txState as any).confirmations,
                    }),
                    of({ kind: 'proxySuccess', proxyAddress: proxyAddress! }),
                  )
                }),
              )
            },
            safeConfirmations,
          ),
        ),
      ),
    )
    .subscribe((ch) => change(ch))
}
