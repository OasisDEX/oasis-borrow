import BigNumber from 'bignumber.js'
import { extractResultFromContractReceipt } from 'blockchain/better-calls/account-factory'
import type { DpmOperationParams } from 'blockchain/better-calls/dpm-account'
import { estimateGas, executeTransaction } from 'blockchain/better-calls/dpm-account'
import { ensureEtherscanExist, getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { getEthereumTransactionFee } from 'blockchain/transaction-fee/get-ethereum-transaction-fee'
import type { ethers } from 'ethers'
import { AutomationFeatures } from 'features/automation/common/types'
import { createEthersTransactionStateMachine } from 'features/stateMachines/transaction'
import type { AaveBasicBuy } from 'helpers/triggers'
import {
  getLtvNumberFromDecodedParam,
  getMaxGasFeeFromDecodedParam,
  parsePriceFromDecodedParam,
} from 'helpers/triggers'
import type {
  SetupAaveAutoBuyParams,
  SetupAutoBuyResponse,
  SetupAutoBuyResponseWithRequiredTransaction,
} from 'helpers/triggers/setup-triggers'
import { hasTransaction } from 'helpers/triggers/setup-triggers'
import { setupAaveAutoBuy } from 'helpers/triggers/setup-triggers/setup-aave-auto-buy'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import type { EventObject } from 'xstate'
import { actions, createMachine, interpret } from 'xstate'

import { createDebouncingMachine } from './debouncingMachine'

const { assign, sendTo } = actions

export type AutoBuyTriggerStates = 'idle' | 'editing' | 'review' | 'tx' | 'txDone' | 'txFailed'

export type AutoBuyTriggerAaveEvent =
  | { type: 'SET_EXECUTION_TRIGGER_LTV'; executionTriggerLTV: number }
  | { type: 'SET_TARGET_TRIGGER_LTV'; targetTriggerLTV: number }
  | { type: 'SET_MAX_BUY_PRICE'; price?: BigNumber }
  | { type: 'SET_USE_MAX_BUY_PRICE'; enabled: boolean }
  | { type: 'SET_MAX_GAS_FEE'; maxGasFee: number }
  | { type: 'CURRENT_TRIGGER_RECEIVED'; currentTrigger: BigNumber }
  | { type: 'UPDATE_DEFAULT_VALUES'; defaults: AutoBuyFormDefaults }
  | { type: 'UPDATE_POSITION_VALUE'; position: PositionLike }
  | { type: 'RESET' }
  | { type: 'TRIGGER_RESPONSE_RECEIVED'; setupTriggerResponse: SetupAutoBuyResponse }
  | { type: 'GAS_ESTIMATION_UPDATED'; gasEstimation: HasGasEstimation }
  | { type: 'GO_TO_EDITING' }
  | { type: 'REVIEW_TRANSACTION' }
  | { type: 'START_TRANSACTION' }
  | { type: 'TRANSACTION_COMPLETED' }
  | { type: 'TRANSACTION_FAILED'; error: string | unknown }

export type AutoBuyFormDefaults = {
  executionTriggerLTV: number
  targetTriggerLTV: number
  minSliderValue: number
  maxSliderValue: number
  maxGasFee: number
}

export type PositionLike = {
  dpm: string
  ltv: number
  collateral: {
    token: {
      symbol: string
      address: string
      decimals: number
    }
    amount: BigNumber
  }
  debt: {
    token: {
      symbol: string
      address: string
      decimals: number
    }
    amount: BigNumber
  }
}

type InternalRequestEventParams = {
  executionTriggerLTV?: number
  targetTriggerLTV?: number
  maxBuyPrice?: BigNumber
  useMaxBuyPrice?: boolean
  maxGasFee?: number
  position?: PositionLike
}

type InternalParametersRequestEvent = {
  type: 'PARAMETERS_REQUESTED'
  params: InternalRequestEventParams
}

type InternalGasEstimationEventParams = {
  signer?: ethers.Signer
  networkId?: NetworkIds
  setupTriggerResponse?: SetupAutoBuyResponse
  position?: PositionLike
}

type InteralGasEsimtationEvent = {
  type: 'INTERNAL_GAS_ESTIMATION'
  params: InternalGasEstimationEventParams
}

const isInternalRequestEvent = (event: EventObject): event is InternalParametersRequestEvent =>
  event.type === 'PARAMETERS_REQUESTED'

const areInternalRequestParamsValid = (
  params: InternalRequestEventParams,
): params is Required<InternalRequestEventParams> => {
  return (
    !!params.executionTriggerLTV &&
    !!params.targetTriggerLTV &&
    !!params.position &&
    !!params.maxGasFee &&
    !!params.useMaxBuyPrice
  )
}

const isInternalGasEstimationEvent = (event: EventObject): event is InteralGasEsimtationEvent =>
  event.type === 'INTERNAL_GAS_ESTIMATION'

const areParamsValid = (
  params: InternalGasEstimationEventParams,
): params is Required<InternalGasEstimationEventParams> => {
  return !!params.signer && !!params.networkId && !!params.setupTriggerResponse && !!params.position
}

export type AutoBuyTriggerAaveContext = {
  isLoading: boolean
  defaults: AutoBuyFormDefaults
  position?: PositionLike
  executionTriggerLTV?: number
  targetTriggerLTV?: number
  maxBuyPrice?: BigNumber
  useMaxBuyPrice: boolean
  maxGasFee: number
  currentTrigger?: AaveBasicBuy
  setupTriggerResponse?: SetupAutoBuyResponse
  gasEstimation: HasGasEstimation
  signer?: ethers.Signer
  networkId: NetworkIds
  retryCount: number
  flow: 'add' | 'edit' | 'cancel'
  feature: AutomationFeatures
}

type ContextForTransaction = {
  networkId: NetworkIds
  signer: ethers.Signer
  position: PositionLike
  setupTriggerResponse: SetupAutoBuyResponseWithRequiredTransaction
}

const ensureValidContextForTransaction = (
  context: AutoBuyTriggerAaveContext,
): context is AutoBuyTriggerAaveContext & ContextForTransaction => {
  return (
    !!context.signer && !!context.networkId && !!context.position && !!context.setupTriggerResponse
  )
}

const getDefaults = (
  context: AutoBuyTriggerAaveContext,
): Pick<
  AutoBuyTriggerAaveContext,
  'executionTriggerLTV' | 'targetTriggerLTV' | 'maxBuyPrice' | 'maxGasFee' | 'useMaxBuyPrice'
> => {
  return {
    maxGasFee:
      getMaxGasFeeFromDecodedParam(context.currentTrigger?.decodedParams.maxBaseFeeInGwei) ?? 300,
    useMaxBuyPrice: true,
    executionTriggerLTV:
      getLtvNumberFromDecodedParam(context.currentTrigger?.decodedParams.execLtv) ??
      context.defaults.executionTriggerLTV,
    targetTriggerLTV:
      getLtvNumberFromDecodedParam(context.currentTrigger?.decodedParams.targetLtv) ??
      context.defaults.targetTriggerLTV,
    maxBuyPrice: parsePriceFromDecodedParam(
      context.currentTrigger?.decodedParams.maxBuyPrice,
      context.position?.debt.token.decimals,
    ),
  }
}

export const autoBuyTriggerAaveStateMachine = createMachine(
  {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import('./autoBuyTriggerAaveStateMachine.typegen').Typegen0,
    schema: {
      context: {} as AutoBuyTriggerAaveContext,
      events: {} as AutoBuyTriggerAaveEvent,
    },
    context: {
      isLoading: false,
      defaults: {
        minSliderValue: 0,
        maxSliderValue: 100,
        executionTriggerLTV: 0,
        targetTriggerLTV: 0,
        maxGasFee: 300,
      },
      maxGasFee: 300,
      useMaxBuyPrice: true,
      gasEstimation: {
        gasEstimationStatus: GasEstimationStatus.unset,
      },
      networkId: NetworkIds.MAINNET,
      retryCount: 0,
      flow: 'add',
      feature: AutomationFeatures.AUTO_BUY,
    },
    preserveActionOrder: true,
    predictableActionArguments: true,
    entry: [],
    id: 'autoBuyTriggerAaveMachine',
    initial: 'idle',
    invoke: [
      {
        src: 'getParameters',
        id: 'getParameters',
      },
      {
        src: 'gasEstimation',
        id: 'gasEstimation',
      },
    ],
    states: {
      idle: {
        entry: ['setDefaultValues'],
        on: {
          SET_EXECUTION_TRIGGER_LTV: {
            target: 'editing',
            actions: ['setExecutionTriggerLTV'],
          },
          SET_TARGET_TRIGGER_LTV: {
            target: 'editing',
            actions: ['setTargetTriggerLTV'],
          },
          SET_MAX_BUY_PRICE: {
            target: 'editing',
            actions: ['setMaxBuyPrice'],
          },
          SET_USE_MAX_BUY_PRICE: {
            target: 'editing',
            actions: ['setUseMaxBuyPrice'],
          },
          SET_MAX_GAS_FEE: {
            target: 'editing',
            actions: ['setMaxGasFee'],
          },
          UPDATE_DEFAULT_VALUES: {
            actions: ['updateDefaultValues', 'setDefaultValues'],
          },
        },
      },
      editing: {
        on: {
          RESET: {
            target: 'idle',
          },
          SET_EXECUTION_TRIGGER_LTV: {
            actions: ['setExecutionTriggerLTV', 'sendRequest', 'setLoading'],
          },
          SET_TARGET_TRIGGER_LTV: {
            actions: ['setTargetTriggerLTV', 'sendRequest', 'setLoading'],
          },
          SET_MAX_BUY_PRICE: {
            actions: ['setMaxBuyPrice', 'sendRequest', 'setLoading'],
          },
          SET_USE_MAX_BUY_PRICE: {
            actions: ['setUseMaxBuyPrice', 'sendRequest', 'setLoading'],
          },
          SET_MAX_GAS_FEE: {
            actions: ['setMaxGasFee', 'sendRequest', 'setLoading'],
          },
          REVIEW_TRANSACTION: {
            cond: 'isReviewable',
            target: 'review',
          },
        },
      },
      review: {
        entry: ['sendRequest'],
        on: {
          RESET: {
            target: 'idle',
          },
          START_TRANSACTION: {
            target: 'tx',
            cond: 'canStartTransaction',
          },
        },
      },
      tx: {
        invoke: [
          {
            src: 'runTransaction',
            id: 'runTransaction',
          },
        ],
        on: {
          TRANSACTION_COMPLETED: {
            target: 'txDone',
          },
          TRANSACTION_FAILED: {
            target: 'txFailed',
          },
        },
      },
      txDone: {
        type: 'final',
      },
      txFailed: {
        entry: ['incrementRetryCount'],
        always: [{ target: 'review' }],
      },
    },
    on: {
      UPDATE_DEFAULT_VALUES: {
        actions: ['updateDefaultValues'],
      },
      UPDATE_POSITION_VALUE: {
        actions: ['updatePositionValue'],
      },
      TRIGGER_RESPONSE_RECEIVED: {
        actions: ['updateTriggerResponse', 'setNotLoading'],
      },
      GAS_ESTIMATION_UPDATED: {
        actions: ['updateGasEstimation'],
      },
      GO_TO_EDITING: {
        target: 'editing',
      },
    },
  },
  {
    guards: {
      isReviewable: (context) => {
        return context.setupTriggerResponse?.transaction !== undefined
      },
      canStartTransaction: (context) => {
        return (
          context.setupTriggerResponse?.transaction !== undefined &&
          context.setupTriggerResponse.errors?.length === 0 &&
          context.gasEstimation.gasEstimationStatus === GasEstimationStatus.calculated
        )
      },
    },
    actions: {
      setDefaultValues: assign((context) => ({
        ...getDefaults(context),
      })),
      updateDefaultValues: assign((_, event) => ({
        defaults: event.defaults,
      })),
      updatePositionValue: assign((_, event) => ({
        position: event.position,
      })),
      setExecutionTriggerLTV: assign((_, event) => ({
        executionTriggerLTV: event.executionTriggerLTV,
      })),
      setTargetTriggerLTV: assign((_, event) => ({
        targetTriggerLTV: event.targetTriggerLTV,
      })),
      setMaxBuyPrice: assign((_, event) => ({
        maxBuyPrice: event.price,
      })),
      setUseMaxBuyPrice: assign((_, event) => ({
        useMaxBuyPrice: event.enabled,
      })),
      setMaxGasFee: assign((_, event) => ({
        maxGasFee: event.maxGasFee,
      })),
      incrementRetryCount: assign((context) => ({
        retryCount: context.retryCount + 1,
      })),
      sendRequest: sendTo(
        'getParameters',
        (context): InternalParametersRequestEvent => ({
          type: 'PARAMETERS_REQUESTED',
          params: {
            executionTriggerLTV: context.executionTriggerLTV,
            targetTriggerLTV: context.targetTriggerLTV,
            position: context.position,
            maxBuyPrice: context.maxBuyPrice,
            maxGasFee: context.maxGasFee,
            useMaxBuyPrice: context.useMaxBuyPrice,
          },
        }),
      ),
      updateTriggerResponse: assign((_, event) => ({
        setupTriggerResponse: event.setupTriggerResponse,
      })),
      updateGasEstimation: assign((_, event) => ({
        gasEstimation: event.gasEstimation,
      })),
      setNotLoading: assign(() => ({
        isLoading: false,
      })),
      setLoading: assign(() => ({
        isLoading: true,
      })),
    },
    services: {
      getParameters: () => (callback, onReceive) => {
        const machine = interpret(
          createDebouncingMachine((request: SetupAaveAutoBuyParams) => setupAaveAutoBuy(request)),
          { id: 'autoBuyParametersDebounceMachine' },
        ).start()

        machine.onTransition((state) => {
          if (state.matches('idle') && state.context?.currentResponse) {
            callback({
              type: 'TRIGGER_RESPONSE_RECEIVED',
              setupTriggerResponse: state.context.currentResponse,
            })
          }
        })

        onReceive((event) => {
          if (isInternalRequestEvent(event) && areInternalRequestParamsValid(event.params)) {
            const request: SetupAaveAutoBuyParams = {
              dpm: event.params.position.dpm,
              executionLTV: new BigNumber(event.params.executionTriggerLTV).times(10 ** 2),
              targetLTV: new BigNumber(event.params.targetTriggerLTV).times(10 ** 2),
              maxBuyPrice: event.params.maxBuyPrice?.times(10 ** 6) ?? zero,
              maxBaseFee: new BigNumber(event.params.maxGasFee),
              protocol: LendingProtocol.AaveV3,
              triggerType: 119,
              strategy: {
                collateralAddress: event.params.position.collateral.token.address,
                debtAddress: event.params.position.debt.token.address,
              },
              networkId: NetworkIds.MAINNET,
            }
            machine.send({
              type: 'REQUEST_UPDATED',
              request: request,
            })
          }
        })

        return () => {
          machine.stop()
        }
      },
      gasEstimation: () => (callback, onReceive) => {
        onReceive(async (event) => {
          callback({
            type: 'GAS_ESTIMATION_UPDATED',
            gasEstimation: {
              gasEstimationStatus: GasEstimationStatus.calculating,
            },
          })

          if (
            isInternalGasEstimationEvent(event) &&
            areParamsValid(event.params) &&
            hasTransaction(event.params.setupTriggerResponse)
          ) {
            const { signer, networkId, setupTriggerResponse, position } = event.params

            const gas = await estimateGas({
              ...setupTriggerResponse.transaction,
              signer,
              networkId,
              proxyAddress: position.dpm,
            })

            const fee = await getEthereumTransactionFee({ estimatedGas: gas })

            if (fee === undefined) {
              callback({
                type: 'GAS_ESTIMATION_UPDATED',
                gasEstimation: {
                  gasEstimationStatus: GasEstimationStatus.error,
                },
              })
            } else {
              callback({
                type: 'GAS_ESTIMATION_UPDATED',
                gasEstimation: {
                  gasEstimationStatus: GasEstimationStatus.calculated,
                  gasEstimationEth: new BigNumber(fee.fee),
                  gasEstimation: parseInt(gas),
                  gasEstimationUsd: new BigNumber(fee.feeUsd),
                },
              })
            }
          }
        })
      },
      runTransaction: (context) => async (callback) => {
        if (!ensureValidContextForTransaction(context)) {
          throw new Error('Invalid context for transaction')
        }

        const contracts = getNetworkContracts(context.networkId)
        ensureEtherscanExist(context.networkId, contracts)

        const { etherscan } = contracts

        const machine = createEthersTransactionStateMachine<DpmOperationParams>().withContext({
          etherscanUrl: etherscan.url,
          transaction: executeTransaction,
          transactionParameters: {
            networkId: context.networkId,
            signer: context.signer,
            data: context.setupTriggerResponse.transaction.data,
            to: context.setupTriggerResponse.transaction.to,
            proxyAddress: context.position.dpm,
          },
          extract: extractResultFromContractReceipt,
        })

        const actor = interpret(machine, {
          id: 'ethersTransactionMachine',
        }).start()

        actor.onTransition((state) => {
          if (state.matches('success')) {
            callback({ type: 'TRANSACTION_COMPLETED' })
          } else if (state.matches('failure')) {
            callback({ type: 'TRANSACTION_FAILED', error: state.context.txError })
          }
        })

        return () => {
          actor.stop()
        }
      },
    },
  },
)
