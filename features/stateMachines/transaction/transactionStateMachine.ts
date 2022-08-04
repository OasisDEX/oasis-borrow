import { TxMeta, TxStatus } from '@oasisdex/transactions'
import { combineLatest, Observable, of } from 'rxjs'
import { first, switchMap } from 'rxjs/operators'
import { assign, Machine, StateMachine } from 'xstate'
import { choose, escalate } from 'xstate/lib/actions'

import { TransactionDef } from '../../../blockchain/calls/callsHelpers'
import { ContextConnected } from '../../../blockchain/network'
import { TxHelpers } from '../../../components/AppContext'
import { transactionToX } from '../../../helpers/form'
import { assertEventType } from '../../../utils/xstate'

type TransactionStateMachineContext<T extends TxMeta> = {
  readonly hasParent: boolean | false
  readonly transactionDef: TransactionDef<T>

  transactionParameters: T

  txHash?: string
  txError?: string
  confirmations?: number
}

export type TransactionStateMachineEvents<T extends TxMeta> =
  | { type: 'START' }
  | { type: 'PARAMETERS_CHANGED'; parameters: T }
  | { type: 'WAITING_FOR_APPROVAL' }
  | { type: 'IN_PROGRESS'; txHash: string }
  | { type: 'FAILURE'; txError?: string }
  | { type: 'CONFIRMED'; confirmations: number }

type TransactionStateMachineSchema = {
  states: {
    idle: {}
    inProgress: {}
    failure: {}
    success: {}
  }
}

enum actions {
  assignParameters = 'assignParameters',
  assignTxHash = 'assignTxHash',
  assignTxError = 'assignTxError',
  assignConfirmations = 'assignConfirmations',
  raiseError = 'raiseError',
}

enum services {
  startTransaction = 'startTransaction',
}

export type TransactionStateMachine<T extends TxMeta> = StateMachine<
  TransactionStateMachineContext<T>,
  TransactionStateMachineSchema,
  TransactionStateMachineEvents<T>
>

export function createTransactionStateMachine<T extends TxMeta>(
  transactionDef: TransactionDef<T>,
  transactionParameters: T,
  withParent: boolean = false,
) {
  return Machine<
    TransactionStateMachineContext<T>,
    TransactionStateMachineSchema,
    TransactionStateMachineEvents<T>
  >(
    {
      id: 'transaction',
      context: {
        hasParent: withParent,
        transactionDef,
        transactionParameters,
      } as TransactionStateMachineContext<T>,
      initial: 'idle',
      states: {
        idle: {
          on: {
            START: {
              target: 'inProgress',
            },
            PARAMETERS_CHANGED: {},
          },
        },
        inProgress: {
          invoke: {
            src: services.startTransaction,
            id: services.startTransaction,
            onDone: {
              target: 'success',
              description: 'Transaction success',
            },
            onError: 'failure',
          },
          on: {
            WAITING_FOR_APPROVAL: {},
            IN_PROGRESS: {
              actions: [actions.assignTxHash],
            },
            FAILURE: {
              target: 'failure',
              actions: [actions.assignTxError],
            },
            CONFIRMED: {
              target: 'success',
              actions: [actions.assignConfirmations],
            },
          },
        },
        failure: {
          entry: [actions.raiseError],
          always: 'idle',
        },
        success: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        [actions.assignParameters]: assign((context, event) => {
          assertEventType(event, 'PARAMETERS_CHANGED')
          return {
            transactionParameters: event.parameters,
          }
        }),
        [actions.assignTxHash]: assign((context, event) => {
          assertEventType(event, 'IN_PROGRESS')
          return {
            txHash: event.txHash,
          }
        }),
        [actions.assignTxError]: assign((context, event) => {
          assertEventType(event, 'FAILURE')
          return {
            txError: event.txError,
          }
        }),
        [actions.assignConfirmations]: assign((context, event) => {
          assertEventType(event, 'CONFIRMED')
          return {
            confirmations: event.confirmations,
          }
        }),
        [actions.raiseError]: choose<
          TransactionStateMachineContext<T>,
          TransactionStateMachineEvents<T>
        >([
          {
            cond: (context) => context.hasParent,
            actions: [escalate((context) => ({ error: context.txError }))],
          },
        ]),
      },
      services: {
        [services.startTransaction]: () => {
          throw new Error('startTransaction not implemented. Pass it via config')
        },
      },
    },
  )
}

export function createTransactionServices<T extends TxMeta>(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
): {
  [services.startTransaction]: (
    context: TransactionStateMachineContext<T>,
    event: TransactionStateMachineEvents<T>,
  ) => Observable<TransactionStateMachineEvents<T>>
} {
  function startTransaction(context: TransactionStateMachineContext<T>) {
    return combineLatest(context$, txHelpers$).pipe(
      first(),
      switchMap(([{ safeConfirmations }, { sendWithGasEstimation }]) => {
        return sendWithGasEstimation(context.transactionDef, context.transactionParameters).pipe(
          transactionToX<TransactionStateMachineEvents<T>, T>(
            {
              type: 'WAITING_FOR_APPROVAL',
            },
            (txState) =>
              of({
                type: 'IN_PROGRESS',
                txHash: (txState as any).txHash as string,
              }),
            (txState) =>
              of({
                type: 'FAILURE',
                txError:
                  txState.status === TxStatus.Error ||
                  txState.status === TxStatus.CancelledByTheUser
                    ? txState.error
                    : undefined,
              }),
            (txState) =>
              of({
                type: 'CONFIRMED',
                confirmations: (txState as any).confirmations,
              }),
            safeConfirmations,
          ),
        )
      }),
    )
  }

  return {
    [services.startTransaction]: startTransaction,
  }
}
