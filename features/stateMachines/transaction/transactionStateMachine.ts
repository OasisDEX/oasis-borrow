import { TxMeta, TxStatus } from '@oasisdex/transactions'
import { combineLatest, Observable, of } from 'rxjs'
import { first, switchMap } from 'rxjs/operators'
import { assign, createMachine } from 'xstate'

import { TransactionDef } from '../../../blockchain/calls/callsHelpers'
import { ContextConnected } from '../../../blockchain/network'
import { TxHelpers } from '../../../components/AppContext'
import { transactionToX } from '../../../helpers/form'

type TransactionStateMachineContext<T extends TxMeta> = {
  readonly transactionDef: TransactionDef<T>

  transactionParameters?: T

  txHash?: string
  txError?: string | unknown
  confirmations?: number
}

export type TransactionStateMachineEvents<T extends TxMeta> =
  | { type: 'START' }
  | { type: 'PARAMETERS_CHANGED'; parameters: T }
  | { type: 'WAITING_FOR_APPROVAL' }
  | { type: 'IN_PROGRESS'; txHash: string }
  | { type: 'FAILURE'; txError?: string }
  | { type: 'CONFIRMED'; confirmations: number }

export function createTransactionStateMachine<T extends TxMeta>(transactionDef: TransactionDef<T>) {
  return createMachine(
    {
      id: 'transaction',
      predictableActionArguments: true,
      tsTypes: {} as import('./transactionStateMachine.typegen').Typegen0,
      context: {
        transactionDef,
      } as TransactionStateMachineContext<T>,
      initial: 'idle',
      schema: {
        context: {} as TransactionStateMachineContext<T>,
        events: {} as TransactionStateMachineEvents<T>,
      },
      states: {
        idle: {
          on: {
            START: {
              target: 'inProgress',
            },
            PARAMETERS_CHANGED: {
              actions: ['assignParameters'],
            },
          },
        },
        inProgress: {
          invoke: {
            src: 'startTransaction',
            id: 'startTransaction',
            onDone: {
              target: 'success',
              description: 'Transaction success',
            },
            onError: {
              actions: ['getError'],
              target: 'failure',
            },
          },
          on: {
            WAITING_FOR_APPROVAL: {},
            IN_PROGRESS: {
              actions: ['assignTxHash'],
            },
            FAILURE: {
              target: 'failure',
              actions: ['assignTxError'],
            },
            CONFIRMED: {
              // Maybe here we want to notify the parent of its success
              target: 'success',
              actions: ['assignConfirmations'],
            },
          },
        },
        failure: {
          entry: ['raiseError'],
          always: 'idle',
        },
        success: {
          entry: ['notifyParent'],
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignParameters: assign((context, event) => {
          return {
            transactionParameters: event.parameters,
          }
        }),
        assignTxHash: assign((context, event) => {
          return {
            txHash: event.txHash,
          }
        }),
        assignTxError: assign((context, event) => {
          return {
            txError: event.txError,
          }
        }),
        assignConfirmations: assign((context, event) => {
          return {
            confirmations: event.confirmations,
          }
        }),
        getError: assign((context, event) => {
          return {
            txError: event.data,
          }
        }),
      },
    },
  )
}

export function startTransactionService<T extends TxMeta>(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
): (context: TransactionStateMachineContext<T>) => Observable<TransactionStateMachineEvents<T>> {
  return (context) => {
    return combineLatest(context$, txHelpers$).pipe(
      first(),
      switchMap(([{ safeConfirmations }, { sendWithGasEstimation }]) => {
        if (context.transactionParameters === undefined) {
          throw new Error('transactionParameters not set')
        }
        return sendWithGasEstimation(context.transactionDef, context.transactionParameters).pipe(
          transactionToX<TransactionStateMachineEvents<T>, T>(
            {
              type: 'WAITING_FOR_APPROVAL',
            },
            (txState) => {
              return of({
                type: 'IN_PROGRESS',
                txHash: (txState as any).txHash as string,
              })
            },
            (txState) => {
              return of({
                type: 'FAILURE',
                txError:
                  txState.status === TxStatus.Error ||
                  txState.status === TxStatus.CancelledByTheUser
                    ? txState.error
                    : undefined,
              })
            },
            (txState) => {
              return of({
                type: 'CONFIRMED',
                confirmations: (txState as any).confirmations,
              })
            },
            safeConfirmations,
          ),
        )
      }),
    )
  }
}

class TransactionStateMachineTypes<T extends TxMeta> {
  needsConfiguration(transaction: TransactionDef<T>) {
    return createTransactionStateMachine(transaction)
  }
  withConfig(transaction: TransactionDef<T>) {
    // @ts-ignore
    return createTransactionStateMachine(transaction).withConfig({})
  }
}

export type TransactionStateMachineWithoutConfiguration<T extends TxMeta> = ReturnType<
  TransactionStateMachineTypes<T>['needsConfiguration']
>
export type TransactionStateMachine<T extends TxMeta> = ReturnType<
  TransactionStateMachineTypes<T>['withConfig']
>
