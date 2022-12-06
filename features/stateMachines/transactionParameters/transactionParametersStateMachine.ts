import { IPositionTransition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { isEqual } from 'lodash'
import { Observable } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { actions, createMachine, sendParent } from 'xstate'

import { callOperationExecutor } from '../../../blockchain/calls/operationExecutor'
import { TxMetaKind } from '../../../blockchain/calls/txMeta'
import { TxHelpers } from '../../../components/AppContext'
import { GasEstimationStatus, HasGasEstimation } from '../../../helpers/form'

const { assign } = actions

export interface BaseTransactionParameters {
  token?: string
  amount?: BigNumber
  proxyAddress: string
}

export type TransactionParametersStateMachineContext<T extends BaseTransactionParameters> = {
  parameters?: T
  strategy?: IPositionTransition
  operationName?: string
  estimatedGas?: number
  estimatedGasPrice?: HasGasEstimation
  txHelper?: TxHelpers
}

export type TransactionParametersStateMachineResponseEvent =
  | { type: 'STRATEGY_RECEIVED'; strategy?: IPositionTransition; operationName: string }
  | { type: 'ERROR_GETTING_STRATEGY' }
  | { type: 'GAS_ESTIMATION_RECEIVED'; estimatedGas: number }
  | { type: 'GAS_PRICE_ESTIMATION_RECEIVED'; estimatedGasPrice: HasGasEstimation }

export type TransactionParametersStateMachineEvent<T> =
  | TransactionParametersStateMachineResponseEvent
  | {
      type: 'VARIABLES_RECEIVED'
      parameters: T
    }
  | { type: 'TX_HELPER_CHANGED'; txHelper: TxHelpers }
  | { type: 'GAS_ESTIMATION_CHANGED'; estimatedGas: number }
  | { type: 'GAS_PRICE_ESTIMATION_CHANGED'; estimatedGasPrice: HasGasEstimation }

export type LibraryCallReturn = { strategy: IPositionTransition; operationName: string }
export type LibraryCallDelegate<T> = (parameters: T) => Promise<LibraryCallReturn>

export function createTransactionParametersStateMachine<T extends BaseTransactionParameters>(
  txHelpers$: Observable<TxHelpers>,
  gasEstimation$: (gas: number) => Observable<HasGasEstimation>,
  libraryCall: LibraryCallDelegate<T>,
) {
  /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAdrdBjZAlgPaYAK6GAtmMmKrAHQzKGZTlU12wDEEJYBgUwA3IgGtBAGwIAjDKgCeAWlzopUgNoAGALqJQAByKwChEgZAAPRAGYAbAHYGATgAsAVlsBGAEweAGhBFRA9tbVdHew97fwBfOKC0LBx8YjIKdGpaegY4Qkp0VigmdFhSVAJcMB4AcQBBAGUAfVIAJQBJAGEAUWaexoAVDoBZeuGAeQA5Zq6ACXqp2p6AER19JBBjU3NMSxsEWxdnbXsXW19vAA5HDz9tWyCQhEdHWwZvRyvrh98XFzOVwSSQw2Dwuw4WS4uXyBEKxTqTX6Q1G4w601mCyWq3Wlm2ZnS+0Q3m0vieiGOETcp3iiRAyTBaRIkOy3B4ADV6p16gAhAAyA2abR6vQ67JxejxJgJFk2Bw8jnJCG8Lm8wPpoNSEMyrPoPEGAA1mnMenzSD02pjFss1pLNvjdkTDtpnFd7Bdvv4ld5vB4XAwrldfJ6PAk6ZgiBA4JYGVr0izoYwCBApGApTtCXLQorgsSfOrY+D4zrE0waMUEzl4PbpY6sy8ybmEHc3K4vH5Q3TC0yMpwq3lYAUisISlAyumZXt6y4IrZPG4Lh4FY43G43Uq3d4GL5buF7PY3L57CTHAXNUXmSX+7D4SPSuVKtUJ3XQAdbI4t74jx43I5fG4-BJdwlX+f1A2DDszxSC9eyha9BzhYc2GfTNX0QQ8GDnH9F2XVd1ybd17A+L5rgXbQfXsK4XCgxltT7bgUNlNCEGUDwGGiTwnFXL8l28BclWUIjwmExxhOPFU-TDOIgA */
  return createMachine(
    {
      context: {},
      tsTypes: {} as import('./transactionParametersStateMachine.typegen').Typegen0,
      schema: {
        context: {} as TransactionParametersStateMachineContext<T>,
        events: {} as TransactionParametersStateMachineEvent<T>,
        services: {} as {
          getParameters: { data: LibraryCallReturn }
        },
      },
      predictableActionArguments: true,
      invoke: {
        src: 'txHelpers$',
        id: 'tx-helpers',
      },
      id: 'transactionParameters',
      initial: 'idle',
      states: {
        idle: {},
        gettingParameters: {
          invoke: {
            src: 'getParameters',
            id: 'library-call',
            onDone: [
              {
                target: 'estimating',
                actions: ['serviceUpdateContext', 'sendStrategy', 'sendGasEstimation'],
              },
            ],
            onError: {
              actions: ['sendError'],
              target: 'idle',
            },
          },
        },
        estimating: {
          invoke: {
            src: 'estimateGas',
            id: 'gas-estimation',
            onError: {
              actions: ['setErrorGasPrice', 'sendGasEstimation'],
            },
          },
          initial: 'gas',
          states: {
            gas: {},
            gasPrice: {
              invoke: {
                src: 'estimateGasPrice',
                id: 'gas-price-estimation',
              },
              on: {
                GAS_PRICE_ESTIMATION_CHANGED: {
                  actions: ['updateContext', 'sendGasEstimation'],
                },
              },
            },
          },
          on: {
            GAS_ESTIMATION_CHANGED: {
              target: '.gasPrice',
              actions: ['updateContext'],
            },
          },
        },
      },
      on: {
        VARIABLES_RECEIVED: {
          target: '.gettingParameters',
          actions: ['updateContext'],
        },
        TX_HELPER_CHANGED: {
          actions: ['updateContext'],
        },
      },
    },
    {
      actions: {
        updateContext: assign((_, event) => ({ ...event })),
        serviceUpdateContext: assign((_, event) => ({ ...event.data })),
        sendStrategy: sendParent(
          (context): TransactionParametersStateMachineResponseEvent => ({
            type: 'STRATEGY_RECEIVED',
            strategy: context.strategy!,
            operationName: context.operationName!,
          }),
        ),
        sendGasEstimation: sendParent(
          (context): TransactionParametersStateMachineResponseEvent => ({
            type: 'GAS_PRICE_ESTIMATION_RECEIVED',
            estimatedGasPrice: context.estimatedGasPrice || {
              gasEstimationStatus: GasEstimationStatus.calculating,
            },
          }),
        ),
        sendError: sendParent('ERROR_GETTING_STRATEGY'),
        setErrorGasPrice: assign((_) => ({
          estimatedGasPrice: { gasEstimationStatus: GasEstimationStatus.error },
        })),
      },
      services: {
        getParameters: async (context) => {
          const call = await libraryCall(context.parameters!)
          return call
        },
        estimateGas: ({ txHelper, parameters, strategy }) => {
          return txHelper!
            .estimateGas(callOperationExecutor, {
              kind: TxMetaKind.operationExecutor,
              calls: strategy!.transaction.calls as any,
              operationName: strategy!.transaction.operationName,
              // @ts-ignore
              token: parameters!.token || parameters!.debtToken,
              amount: parameters!.amount,
              proxyAddress: parameters!.proxyAddress,
            })
            .pipe(
              distinctUntilChanged<number>(isEqual),
              map((estimatedGas) => ({ type: 'GAS_ESTIMATION_CHANGED', estimatedGas })),
            )
        },
        estimateGasPrice: ({ estimatedGas }) =>
          gasEstimation$(estimatedGas!).pipe(
            distinctUntilChanged<HasGasEstimation>(isEqual),
            map((gasPriceEstimation) => ({
              type: 'GAS_PRICE_ESTIMATION_CHANGED',
              estimatedGasPrice: gasPriceEstimation,
            })),
          ),
        txHelpers$: (_) =>
          txHelpers$.pipe(map((txHelper) => ({ type: 'TX_HELPER_CHANGED', txHelper }))),
      },
    },
  )
}

class TransactionParametersStateMachineTypes<T extends BaseTransactionParameters> {
  withConfig(
    txHelpers$: Observable<TxHelpers>,
    gasEstimation$: (gas: number) => Observable<HasGasEstimation>,
    libraryCall: LibraryCallDelegate<T>,
  ) {
    return createTransactionParametersStateMachine<T>(
      txHelpers$,
      gasEstimation$,
      libraryCall,
      // @ts-ignore
    ).withConfig({})
  }
}

export type TransactionParametersStateMachine<T extends BaseTransactionParameters> = ReturnType<
  TransactionParametersStateMachineTypes<T>['withConfig']
>
