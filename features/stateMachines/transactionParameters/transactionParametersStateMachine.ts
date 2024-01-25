import type {
  IMultiplyStrategy,
  IOpenDepositBorrowStrategy,
  IStrategy,
} from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { DpmExecuteOperationExecutorActionParameters } from 'blockchain/better-calls/dpm-account'
import { estimateGasOnDpmForOperationExecutorAction } from 'blockchain/better-calls/dpm-account'
import type { EstimatedGasResult } from 'blockchain/better-calls/utils/types'
import { callOperationExecutorWithDpmProxy } from 'blockchain/calls/operationExecutor'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { ethNullAddress, NetworkIds } from 'blockchain/networks'
import { getTransactionFee } from 'blockchain/transaction-fee'
import type { ethers } from 'ethers'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { zero } from 'helpers/zero'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { fromPromise } from 'rxjs/internal-compatibility'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { actions, createMachine, sendParent } from 'xstate'

const { assign } = actions

const MAX_RETRIES = 3

export interface BaseTransactionParameters {
  token?: string
  amount?: BigNumber
  proxyAddress: string
}

export type TransactionParametersStateMachineContext<T extends BaseTransactionParameters> = {
  parameters?: T
  strategy?: IStrategy

  /**
   * @deprecated This is old stuff. It uses `web3.js`. We want to move to `ethers.js` and get rid of RxJS.
   */
  txHelper?: TxHelpers

  /**
   * @deprecated Result of txHelper. It won't be supported.
   */
  estimatedGas?: number
  estimatedGasPrice?: HasGasEstimation

  gasEstimationResult?: EstimatedGasResult
  signer?: ethers.Signer

  retries?: number // number of retries for gas estimation
  networkId: NetworkIds
  runWithEthers: boolean
}

export type TransactionParametersStateMachineResponseEvent =
  | {
      type: 'STRATEGY_RECEIVED'
      transition?: IStrategy | IOpenDepositBorrowStrategy
    }
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
  | { type: 'ETHERS_GAS_ESTIMATION_CHANGED'; gasEstimationResult: EstimatedGasResult }
  | { type: 'SIGNER_CHANGED'; signer: ethers.Signer }
  | { type: 'GAS_PRICE_ESTIMATION_CHANGED'; estimatedGasPrice: HasGasEstimation }

export type LibraryCallReturn = IMultiplyStrategy | IStrategy
export type LibraryCallDelegate<T> = (parameters: T) => Promise<LibraryCallReturn>

export function createTransactionParametersStateMachine<T extends BaseTransactionParameters>(
  txHelpers$: Observable<TxHelpers>,
  gasEstimation$: (gas: number) => Observable<HasGasEstimation>,
  libraryCall: LibraryCallDelegate<T>,
  networkId: NetworkIds,
  transactionType: 'open' | 'close' | 'adjust' | 'depositBorrow' | 'openDepositBorrow' | 'types',
  runWithEthers: boolean = false,
) {
  /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAdrdBjZAlgPaYAK6GAtmMmKrAHQzKGZTlU12wDEEJYBgUwA3IgGtBAGwIAjDKgCeAWlzopUgNoAGALqJQAByKwChEgZAAPRAGYAbAHYGATgAsAVlsBGAEweAGhBFRA9tbVdHew97fwBfOKC0LBx8YjIKdGpaegY4Qkp0VigmdFhSVAJcMB4AcQBBAGUAfVIAJQBJAGEAUWaexoAVDoBZeuGAeQA5Zq6ACXqp2p6AER19JBBjU3NMSxsEWxdnbXsXW19vAA5HDz9tWyCQhEdHWwZvRyvrh98XFzOVwSSQw2Dwuw4WS4uXyBEKxTqTX6Q1G4w601mCyWq3Wlm2ZnS+0Q3m0vieiGOETcp3iiRAyTBaRIkOy3B4ADV6p16gAhAAyA2abR6vQ67JxejxJgJFk2Bw8jnJCG8Lm8wPpoNSEMyrPoPEGAA1mnMenzSD02pjFss1pLNvjdkTDtpnFd7Bdvv4ld5vB4XAwrldfJ6PAk6ZgiBA4JYGVr0izoYwCBApGApTtCXLQorgsSfOrY+D4zrE0waMUEzl4PbpY6sy8ybmEHc3K4vH5Q3TC0yMpwq3lYAUisISlAyumZXt6y4IrZPG4Lh4FY43G43Uq3d4GL5buF7PY3L57CTHAXNUXmSX+7D4SPSuVKtUJ3XQAdbI4t74jx43I5fG4-BJdwlX+f1A2DDszxSC9eyha9BzhYc2GfTNX0QQ8GDnH9F2XVd1ybd17A+L5rgXbQfXsK4XCgxltT7bgUNlNCEGUDwGGiTwnFXL8l28BclWUIjwmExxhOPFU-TDOIgA */
  return createMachine(
    {
      context: {
        networkId: networkId,
        runWithEthers: runWithEthers,
      },
      //eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./transactionParametersStateMachine.typegen').Typegen0,
      schema: {
        context: {} as TransactionParametersStateMachineContext<T>,
        events: {} as TransactionParametersStateMachineEvent<T>,
        services: {} as {
          getParameters: { data: LibraryCallReturn }
        },
      },
      predictableActionArguments: true,
      invoke: [
        {
          src: 'txHelpers$',
          id: 'tx-helpers',
        },
      ],
      id: 'transactionParameters',
      initial: 'idle',
      states: {
        idle: {},
        gettingParameters: {
          entry: ['setRetries'],
          on: {
            VARIABLES_RECEIVED: {
              target: 'gettingParameters',
              cond: 'parametersReady',
              actions: ['updateContext', 'resetRetries'],
            },
          },
          invoke: {
            src: 'getParameters',
            id: 'library-call',
            onDone: [
              {
                target: 'estimating',
                cond: 'hasRealProxyAddress',
                actions: ['serviceUpdateContext', 'sendStrategy', 'sendGasEstimation'],
              },
              {
                target: 'idle',
                cond: 'hasMockProxyAddress',
                actions: ['serviceUpdateContext', 'sendStrategy'],
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
            onError: [
              {
                actions: ['setErrorGasPrice', 'sendGasEstimation'],
                cond: 'isRetryable',
                target: 'gettingParameters',
              },
              {
                actions: ['setErrorGasPrice', 'sendGasEstimation'],
              },
            ],
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
            ETHERS_GAS_ESTIMATION_CHANGED: {
              target: '.gasPrice',
              actions: ['updateContext'],
            },
          },
        },
      },
      on: {
        VARIABLES_RECEIVED: {
          target: '.gettingParameters',
          cond: 'parametersReady',
          actions: ['updateContext', 'resetRetries'],
        },
        TX_HELPER_CHANGED: {
          actions: ['updateContext'],
        },
        SIGNER_CHANGED: {
          actions: ['updateContext'],
        },
      },
    },
    {
      actions: {
        updateContext: assign((_, event) => ({ ...event })),
        serviceUpdateContext: assign((_, event) => {
          return { strategy: event.data }
        }),
        sendStrategy: sendParent(
          (context): TransactionParametersStateMachineResponseEvent => ({
            type: 'STRATEGY_RECEIVED',
            transition: context.strategy!,
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
        setRetries: assign((context) => ({ retries: (context.retries || 0) + 1 })),
        resetRetries: assign((_) => ({ retries: 0 })),
      },
      services: {
        getParameters: async (context) => libraryCall(context.parameters!),
        estimateGas: ({ txHelper, parameters, strategy, signer, networkId, runWithEthers }) => {
          if (signer && runWithEthers) {
            const dpmParams: DpmExecuteOperationExecutorActionParameters = {
              calls: strategy!.transaction.calls,
              operationName: strategy!.transaction.operationName,
              signer: signer!,
              proxyAddress: parameters!.proxyAddress,
              value: parameters!.token === 'ETH' ? parameters!.amount! : zero,
              networkId: networkId,
            }
            return fromPromise(estimateGasOnDpmForOperationExecutorAction(dpmParams)).pipe(
              map((estimatedGas) => ({
                type: 'ETHERS_GAS_ESTIMATION_CHANGED',
                gasEstimationResult: estimatedGas,
              })),
              distinctUntilChanged<number>(isEqual),
            )
          } else {
            return txHelper!
              .estimateGas(callOperationExecutorWithDpmProxy, {
                kind: TxMetaKind.operationExecutor,
                calls: strategy!.transaction.calls as any,
                operationName: strategy!.transaction.operationName,
                token: parameters!.token,
                amount: parameters!.amount,
                proxyAddress: parameters!.proxyAddress,
              })
              .pipe(
                map((estimatedGas) => ({ type: 'GAS_ESTIMATION_CHANGED', estimatedGas })),
                distinctUntilChanged<number>(isEqual),
              )
          }
        },
        estimateGasPrice: ({ estimatedGas, networkId, gasEstimationResult }) => {
          if (networkId === NetworkIds.MAINNET) {
            if (!estimatedGas && !gasEstimationResult?.estimatedGas) {
              throw new Error('Error estimating gas price: no gas amount.')
            }
            return gasEstimation$(estimatedGas || Number(gasEstimationResult!.estimatedGas)).pipe(
              distinctUntilChanged<HasGasEstimation>(isEqual),
              map((gasPriceEstimation) => ({
                type: 'GAS_PRICE_ESTIMATION_CHANGED',
                estimatedGasPrice: gasPriceEstimation,
              })),
            )
          }

          return fromPromise(getTransactionFee({ ...gasEstimationResult, networkId })).pipe(
            map((transactionFee) => {
              if (!transactionFee) {
                return {
                  type: 'GAS_PRICE_ESTIMATION_CHANGED',
                  estimatedGasPrice: {
                    gasEstimationStatus: GasEstimationStatus.error,
                  },
                }
              }
              return {
                type: 'GAS_PRICE_ESTIMATION_CHANGED',
                estimatedGasPrice: {
                  gasEstimationStatus: GasEstimationStatus.calculated,
                  gasEstimationEth: new BigNumber(transactionFee.fee),
                  gasEstimationUsd: new BigNumber(transactionFee.feeUsd),
                },
              }
            }),
          )
        },
        txHelpers$: (_) =>
          txHelpers$.pipe(map((txHelper) => ({ type: 'TX_HELPER_CHANGED', txHelper }))),
      },
      guards: {
        hasRealProxyAddress: ({ parameters }) => {
          return parameters?.proxyAddress !== ethNullAddress
        },
        hasMockProxyAddress: ({ parameters }) => {
          return parameters?.proxyAddress === ethNullAddress
        },
        isRetryable: ({ retries }) => {
          return retries! <= MAX_RETRIES
        },
        parametersReady: (_, { parameters }) => {
          switch (transactionType) {
            case 'close':
              // @ts-ignore
              return !!parameters.manageTokenInput.closingToken
            default:
              // defaults to true, cause the above is the only thing i need to check
              return true
          }
        },
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
      NetworkIds.MAINNET,
      'types',
      // @ts-ignore
    ).withConfig({})
  }
}

export type TransactionParametersStateMachine<T extends BaseTransactionParameters> = ReturnType<
  TransactionParametersStateMachineTypes<T>['withConfig']
>
