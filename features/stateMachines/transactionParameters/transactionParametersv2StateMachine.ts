import type { IPosition, Strategy } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { DpmExecuteOperationParameters } from 'blockchain/better-calls/dpm-account'
import { estimateGasOnDpmForOperationExecutorAction } from 'blockchain/better-calls/dpm-account'
import type { EstimatedGasResult } from 'blockchain/better-calls/utils/types'
import { ethNullAddress, NetworkIds } from 'blockchain/networks'
import { getTransactionFee } from 'blockchain/transaction-fee'
import type { ethers } from 'ethers'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { isEqual } from 'lodash'
import { fromPromise } from 'rxjs/internal-compatibility'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { actions, createMachine, sendParent } from 'xstate'

const { assign } = actions

const MAX_RETRIES = 3

export interface BaseTransactionParametersV2 {
  proxyAddress: string
}

export type TransactionParametersV2StateMachineContext<T extends BaseTransactionParametersV2> = {
  parameters?: T
  strategy?: Strategy<IPosition>
  estimatedGasPrice?: HasGasEstimation
  gasEstimationResult?: EstimatedGasResult
  signer?: ethers.Signer
  retries?: number // number of retries for gas estimation
  networkId: NetworkIds
}

export type TransactionParametersV2StateMachineResponseEvent =
  | {
      type: 'STRATEGY_RECEIVED'
      strategy?: Strategy<IPosition>
    }
  | { type: 'ERROR_GETTING_STRATEGY' }
  | { type: 'GAS_ESTIMATION_RECEIVED'; estimatedGas: number }
  | { type: 'GAS_PRICE_ESTIMATION_RECEIVED'; estimatedGasPrice: HasGasEstimation }

export type TransactionParametersV2StateMachineEvent<T> =
  | TransactionParametersV2StateMachineResponseEvent
  | {
      type: 'VARIABLES_RECEIVED'
      parameters: T
    }
  | { type: 'ETHERS_GAS_ESTIMATION_CHANGED'; gasEstimationResult: EstimatedGasResult }
  | { type: 'SIGNER_CHANGED'; signer: ethers.Signer }
  | { type: 'GAS_PRICE_ESTIMATION_CHANGED'; estimatedGasPrice: HasGasEstimation }

export type LibraryCallDelegateV2<T> = (parameters: T) => Promise<Strategy<IPosition>>

export function createTransactionParametersV2StateMachine<T extends BaseTransactionParametersV2>(
  libraryCall: LibraryCallDelegateV2<T>,
  networkId: NetworkIds,
) {
  return createMachine(
    {
      context: {
        networkId: networkId,
      },
      //eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./transactionParametersv2StateMachine.typegen').Typegen0,
      schema: {
        context: {} as TransactionParametersV2StateMachineContext<T>,
        events: {} as TransactionParametersV2StateMachineEvent<T>,
        services: {} as {
          getParameters: { data: Strategy<IPosition> }
        },
      },
      predictableActionArguments: true,
      preserveActionOrder: true,
      id: 'transactionParametersV2',
      initial: 'idle',
      states: {
        idle: {},
        gettingParameters: {
          entry: ['setRetries'],
          on: {
            VARIABLES_RECEIVED: {
              target: 'gettingParameters',
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
          actions: ['updateContext', 'resetRetries'],
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
          (context): TransactionParametersV2StateMachineResponseEvent => ({
            type: 'STRATEGY_RECEIVED',
            strategy: context.strategy!,
          }),
        ),
        sendGasEstimation: sendParent(
          (context): TransactionParametersV2StateMachineResponseEvent => ({
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
        estimateGas: ({ parameters, strategy, signer, networkId }) => {
          const dpmParams: DpmExecuteOperationParameters = {
            signer: signer!,
            proxyAddress: parameters!.proxyAddress,
            networkId: networkId,
            tx: strategy!.tx,
          }
          return fromPromise(estimateGasOnDpmForOperationExecutorAction(dpmParams)).pipe(
            map((estimatedGas) => ({
              type: 'ETHERS_GAS_ESTIMATION_CHANGED',
              gasEstimationResult: estimatedGas,
            })),
            distinctUntilChanged<number>(isEqual),
          )
        },
        estimateGasPrice: ({ networkId, gasEstimationResult }) => {
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
      },
    },
  )
}

class TransactionParametersV2StateMachineTypes<T extends BaseTransactionParametersV2> {
  withConfig(libraryCall: LibraryCallDelegateV2<T>) {
    return createTransactionParametersV2StateMachine<T>(
      libraryCall,
      NetworkIds.MAINNET,
      // @ts-ignore
    ).withConfig({})
  }
}

export type TransactionParametersV2StateMachine<T extends BaseTransactionParametersV2> = ReturnType<
  TransactionParametersV2StateMachineTypes<T>['withConfig']
>
