import { TxStatus } from '@oasisdex/transactions'
import type { BigNumber } from 'bignumber.js'
import type { ReclaimData } from 'blockchain/calls/proxyActions/proxyActions';
import { reclaim } from 'blockchain/calls/proxyActions/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import type { Context, ContextConnected } from 'blockchain/network'
import type { TxHelpers } from 'helpers/context/types'
import { transactionToX } from 'helpers/form'
import type { TxError } from 'helpers/types'
import type { Observable } from 'rxjs';
import { combineLatest, of, Subject } from 'rxjs'
import { scan, startWith, switchMap } from 'rxjs/operators'

export type ReclaimChange =
  | { kind: 'reclaimWaitingForApproval' }
  | {
      kind: 'reclaimInProgress'
      manageTxHash: string
    }
  | {
      kind: 'reclaimFailure'
      txError?: TxError
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

interface ReclaimState {
  reclaim: () => void
  txStatus?: string
}

export function apply(state: ReclaimState, change: ReclaimChange): ReclaimState {
  return {
    ...state,
    txStatus: change.kind,
  }
}

export function createReclaimCollateral$(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  id: BigNumber,
  token: string,
  amount: BigNumber,
) {
  const change$ = new Subject<ReclaimChange>()

  function change(ch: ReclaimChange) {
    change$.next(ch)
  }

  return context$.pipe(
    switchMap((context) => {
      return combineLatest(txHelpers$, proxyAddress$((context as ContextConnected).account)).pipe(
        switchMap(([txHelpers, proxyAddress]) => {
          const initialState = {
            reclaim: () =>
              reclaimCollateral(txHelpers, proxyAddress!, amount, token, id).subscribe((ch) =>
                change(ch),
              ),
          }

          return change$.pipe(scan(apply, initialState), startWith(initialState))
        }),
      )
    }),
  )
}
