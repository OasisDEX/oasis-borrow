import type { TxMeta, TxState } from '@oasisdex/transactions'
import { TxStatus } from '@oasisdex/transactions'
import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import type { Context, ContextConnected } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { transactionToX } from 'helpers/form'
import type { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/internal/operators'
import { first, map, switchMap } from 'rxjs/operators'
import type { AnyEventObject } from 'xstate'
import { assign, createMachine, sendParent } from 'xstate'

type BaseTransactionStateMachineContext = {
  txHash?: string
  txError?: string | unknown
  confirmations?: number
  etherscanUrl?: string
}

type TransactionStateMachineContext<T extends TxMeta, TResult> = {
  readonly transactionDef: TransactionDef<T>
  transactionParameters: T
  result?: TResult
} & BaseTransactionStateMachineContext

export type TransactionStateMachineResultEvents<TResult = unknown> =
  | { type: 'TRANSACTION_COMPLETED'; result?: TResult }
  | { type: 'TRANSACTION_FAILED'; error: string | unknown }

export type TransactionStateMachineCommonEvents = {
  type: 'ETHERSCAN_URL_CHANGED'
  etherscanUrl: string
}

export type TransactionStateMachineEvents<T extends TxMeta, TResult> =
  | TransactionStateMachineCommonEvents
  | TransactionStateMachineResultEvents<TResult>
  | { type: 'START' }
  | { type: 'PARAMETERS_CHANGED'; parameters: T }
  | { type: 'WAITING_FOR_APPROVAL' }
  | { type: 'IN_PROGRESS'; txHash: string }
  | { type: 'FAILURE'; txError?: string }
  | { type: 'CONFIRMED'; confirmations: number; result?: TResult }

export function createTransactionStateMachine<T extends TxMeta, TResult = unknown>(
  transactionDef: TransactionDef<T>,
  transactionParameters: T,
) {
  return createMachine(
    {
      id: 'transaction',
      predictableActionArguments: true,
      preserveActionOrder: true,
      //eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./transactionStateMachine.typegen').Typegen0,
      context: {
        transactionDef,
        transactionParameters,
      },
      initial: 'inProgress',
      schema: {
        context: {} as TransactionStateMachineContext<T, TResult>,
        events: {} as TransactionStateMachineEvents<T, TResult>,
      },
      invoke: [
        {
          src: 'etherScanUrl$',
          id: 'etherScanUrl$',
        },
      ],
      states: {
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
              actions: ['updateContext'],
            },
            FAILURE: {
              target: 'failure',
              actions: ['updateContext', 'sendFailure'],
            },
            CONFIRMED: {
              // Maybe here we want to notify the parent of its success
              target: 'success',
              actions: ['updateContext'],
            },
          },
        },
        failure: {
          entry: ['sendFailure'],
        },
        success: {
          entry: ['sendSuccess'],
          type: 'final',
        },
      },
      on: {
        ETHERSCAN_URL_CHANGED: {
          actions: ['updateContext'],
        },
      },
    },
    {
      actions: {
        updateContext: assign((context, event) => ({ ...event })),
        getError: assign((context, event) => {
          return {
            txError: event.data,
          }
        }),
        sendSuccess: sendParent((context) => ({
          type: 'TRANSACTION_COMPLETED',
          result: context.result,
        })),
        sendFailure: sendParent((context) => ({
          type: 'TRANSACTION_FAILED',
          error: context.txError,
        })),
      },
    },
  )
}

export function startTransactionService<T extends TxMeta, TResult = unknown>(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
  transformResult?: (context: ContextConnected, result: TxState<T>) => TResult | undefined,
): (
  context: TransactionStateMachineContext<T, TResult>,
) => Observable<TransactionStateMachineEvents<T, TResult>> {
  return (context) => {
    return combineLatest(context$, txHelpers$).pipe(
      first(),
      switchMap(([connectedContext, { send, sendWithGasEstimation }]) => {
        if (context.transactionParameters === undefined) {
          throw new Error('transactionParameters not set')
        }
        const properFunction =
          connectedContext.chainId === NetworkIds.MAINNET ? sendWithGasEstimation : send

        return properFunction(context.transactionDef, context.transactionParameters).pipe(
          transactionToX<TransactionStateMachineEvents<T, TResult>, T>(
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
                result: transformResult && transformResult(connectedContext, txState),
              })
            },
            getNetworkContracts(NetworkIds.MAINNET, connectedContext.chainId).safeConfirmations,
          ),
        )
      }),
    )
  }
}

export function transactionContextService(
  context$: Observable<Context>,
): CommonTransactionServices {
  return {
    etherScanUrl$: (_) =>
      context$.pipe(
        map((c) => ({
          type: 'ETHERSCAN_URL_CHANGED',
          etherscanUrl: getNetworkContracts(NetworkIds.MAINNET, c.chainId).etherscan.url,
        })),
        distinctUntilChanged((a, b) => a.etherscanUrl === b.etherscanUrl),
      ),
  }
}

class TransactionStateMachineTypes<T extends TxMeta, TResult = unknown> {
  needsConfiguration(transaction: TransactionDef<T>, transactionParameters: T) {
    return createTransactionStateMachine<T, TResult>(transaction, transactionParameters)
  }
  withConfig(transaction: TransactionDef<T>) {
    // @ts-ignore
    return createTransactionStateMachine<T, TResult>(transaction).withConfig({})
  }
}

export type TransactionStateMachine<T extends TxMeta, TResult = unknown> = ReturnType<
  TransactionStateMachineTypes<T, TResult>['withConfig']
>

type MissingTransactionServices = Exclude<
  //eslint-disable-next-line @typescript-eslint/consistent-type-imports
  import('./transactionStateMachine.typegen').Typegen0['missingImplementations']['services'],
  'startTransaction'
>
export type CommonTransactionServices = Record<
  MissingTransactionServices,
  (
    context: BaseTransactionStateMachineContext,
    event: AnyEventObject,
  ) => Observable<TransactionStateMachineCommonEvents>
>
