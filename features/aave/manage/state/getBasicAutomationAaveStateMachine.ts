import BigNumber from 'bignumber.js'
import type { DpmOperationParams } from 'blockchain/better-calls/dpm-account'
import { estimateGas, executeTransaction } from 'blockchain/better-calls/dpm-account'
import { ensureEtherscanExist, getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import type { TransactionFee } from 'blockchain/transaction-fee/get-transaction-fee'
import { getTransactionFee } from 'blockchain/transaction-fee/get-transaction-fee'
import type { ethers } from 'ethers'
import { maxUint256 } from 'features/automation/common/consts'
import { AutomationFeatures } from 'features/automation/common/types'
import { createEthersTransactionStateMachine } from 'features/stateMachines/transaction'
import { allDefined } from 'helpers/allDefined'
import type { AaveBasicBuy, AaveBasicSell } from 'helpers/triggers'
import {
  getLtvNumberFromDecodedParam,
  getMaxGasFeeFromDecodedParam,
  parsePriceFromDecodedParam,
} from 'helpers/triggers'
import type {
  SetupAaveBasicAutomationParams,
  SetupBasicAutoResponse,
  SetupBasicAutoResponseWithRequiredTransaction,
} from 'helpers/triggers/setup-triggers'
import {
  hasTransaction,
  setupAaveAutoBuy,
  setupAaveAutoSell,
  TriggerAction,
} from 'helpers/triggers/setup-triggers'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { LendingProtocol } from 'lendingProtocols'
import type { EventObject } from 'xstate'
import { actions, createMachine, interpret } from 'xstate'

import { createDebouncingMachine } from './debouncingMachine'
import type { PositionLike } from './triggersCommon'

const { assign, sendTo } = actions

export type BasicAutomationAaveState =
  | 'idle'
  | 'editing'
  | 'review'
  | 'remove'
  | 'tx'
  | 'txDone'
  | 'txFailed'

export type BasicAutoTrigger = AaveBasicBuy | AaveBasicSell

export type BasicAutomationAaveEvent<Trigger extends BasicAutoTrigger> =
  | { type: 'SET_EXECUTION_TRIGGER_LTV'; executionTriggerLTV: number }
  | { type: 'SET_TARGET_TRIGGER_LTV'; targetTriggerLTV: number }
  | { type: 'SET_PRICE'; price?: BigNumber }
  | { type: 'SET_USE_PRICE'; enabled: boolean }
  | { type: 'SET_MAX_GAS_FEE'; maxGasFee: number }
  | { type: 'CURRENT_TRIGGER_RECEIVED'; currentTrigger: Trigger | undefined }
  | { type: 'UPDATE_DEFAULT_VALUES'; defaults: BasicAutomationAaveFormDefaults }
  | { type: 'UPDATE_POSITION_VALUE'; position?: PositionLike }
  | { type: 'RESET' }
  | { type: 'TRIGGER_RESPONSE_RECEIVED'; setupTriggerResponse: SetupBasicAutoResponse }
  | { type: 'GAS_ESTIMATION_UPDATED'; gasEstimation: HasGasEstimation }
  | { type: 'SIGNER_UPDATED'; signer?: ethers.Signer }
  | { type: 'GO_TO_EDITING' }
  | { type: 'REMOVE_TRIGGER' }
  | { type: 'REVIEW_TRANSACTION' }
  | { type: 'START_TRANSACTION' }
  | { type: 'TRANSACTION_COMPLETED' }
  | { type: 'TRANSACTION_FAILED'; error: string | unknown }

export type BasicAutomationAaveFormDefaults = {
  executionTriggerLTV: number
  targetTriggerLTV: number
  minSliderValue: number
  maxSliderValue: number
  maxGasFee: number
}

type InternalRequestEventParams = {
  executionTriggerLTV?: number
  targetTriggerLTV?: number
  price?: BigNumber
  usePrice?: boolean
  maxGasFee?: number
  position?: PositionLike
  action?: TriggerAction
}

type InternalParametersRequestEvent = {
  type: 'PARAMETERS_REQUESTED'
  params: InternalRequestEventParams
}

type InternalGasEstimationEventParams = {
  signer?: ethers.Signer
  networkId?: NetworkIds
  setupTriggerResponse?: SetupBasicAutoResponse
  position?: PositionLike
}

type InternalGasEstimationEvent = {
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
    !!params.action
  )
}

const isInternalGasEstimationEvent = (event: EventObject): event is InternalGasEstimationEvent =>
  event.type === 'INTERNAL_GAS_ESTIMATION'

const areParamsValid = (
  params: InternalGasEstimationEventParams,
): params is Required<InternalGasEstimationEventParams> => {
  return !!params.signer && !!params.networkId && !!params.setupTriggerResponse && !!params.position
}

export type BasicAutomationAaveContext<Trigger extends BasicAutoTrigger> = {
  isLoading: boolean
  defaults: BasicAutomationAaveFormDefaults
  position?: PositionLike
  executionTriggerLTV?: number
  targetTriggerLTV?: number
  price?: BigNumber
  usePrice: boolean
  maxGasFee: number
  currentTrigger?: Trigger
  setupTriggerResponse?: SetupBasicAutoResponse
  gasEstimation: HasGasEstimation
  signer?: ethers.Signer
  networkId: NetworkIds
  retryCount: number
  action: TriggerAction
  feature: AutomationFeatures.AUTO_BUY | AutomationFeatures.AUTO_SELL
}

type ContextForTransaction = {
  networkId: NetworkIds
  signer: ethers.Signer
  position: PositionLike
  setupTriggerResponse: SetupBasicAutoResponseWithRequiredTransaction
}

const ensureValidContextForTransaction = <Trigger extends BasicAutoTrigger>(
  context: BasicAutomationAaveContext<Trigger>,
): context is BasicAutomationAaveContext<Trigger> & ContextForTransaction => {
  return (
    !!context.signer && !!context.networkId && !!context.position && !!context.setupTriggerResponse
  )
}

const getPriceFromDecodedParam = (trigger: BasicAutoTrigger | undefined): string | undefined => {
  if (trigger?.decodedParams === undefined) {
    return undefined
  }

  if ('maxBuyPrice' in trigger.decodedParams) {
    if (trigger.decodedParams.maxBuyPrice === maxUint256.toString()) {
      return undefined
    }
    return trigger.decodedParams.maxBuyPrice
  }

  if ('minSellPrice' in trigger.decodedParams) {
    if (trigger.decodedParams.minSellPrice === '0') {
      return undefined
    }
    return trigger.decodedParams.minSellPrice
  }

  return undefined
}

const getDefaults = (
  context: BasicAutomationAaveContext<BasicAutoTrigger>,
): Pick<
  BasicAutomationAaveContext<BasicAutoTrigger>,
  'executionTriggerLTV' | 'targetTriggerLTV' | 'price' | 'maxGasFee' | 'usePrice'
> => {
  const price = parsePriceFromDecodedParam(
    getPriceFromDecodedParam(context.currentTrigger),
    context.position?.debt.token.decimals,
  )

  return {
    maxGasFee:
      getMaxGasFeeFromDecodedParam(context.currentTrigger?.decodedParams.maxBaseFeeInGwei) ?? 300,
    usePrice: allDefined(price),
    executionTriggerLTV:
      getLtvNumberFromDecodedParam(context.currentTrigger?.decodedParams.executionLtv) ??
      context.defaults.executionTriggerLTV,
    targetTriggerLTV:
      getLtvNumberFromDecodedParam(context.currentTrigger?.decodedParams.targetLtv) ??
      context.defaults.targetTriggerLTV,
    price: price,
  }
}

const getBasicAutomationAaveStateMachine = <Trigger extends BasicAutoTrigger>(
  automationFeature: AutomationFeatures.AUTO_BUY | AutomationFeatures.AUTO_SELL,
  action: (params: SetupAaveBasicAutomationParams) => Promise<SetupBasicAutoResponse>,
  triggerType: 119 | 120,
) =>
  createMachine(
    {
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./getBasicAutomationAaveStateMachine.typegen').Typegen0,
      schema: {
        context: {} as BasicAutomationAaveContext<Trigger>,
        events: {} as BasicAutomationAaveEvent<Trigger>,
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
        usePrice: true,
        gasEstimation: {
          gasEstimationStatus: GasEstimationStatus.unset,
        },
        networkId: NetworkIds.MAINNET,
        retryCount: 0,
        action: TriggerAction.Add,
        feature: automationFeature,
      },
      preserveActionOrder: true,
      predictableActionArguments: true,
      entry: [],
      id: `${automationFeature}AaveMachine`,
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
            SET_PRICE: {
              target: 'editing',
              actions: ['setPrice'],
            },
            SET_USE_PRICE: {
              target: 'editing',
              actions: ['setUsePrice'],
            },
            SET_MAX_GAS_FEE: {
              target: 'editing',
              actions: ['setMaxGasFee'],
            },
            UPDATE_DEFAULT_VALUES: {
              actions: ['updateDefaultValues', 'setDefaultValues'],
            },
            REMOVE_TRIGGER: {
              actions: ['setRemoveAction'],
              cond: 'canRemove',
              target: 'remove',
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
            SET_PRICE: {
              actions: ['setPrice', 'sendRequest', 'setLoading'],
            },
            SET_USE_PRICE: {
              actions: ['setUsePrice', 'sendRequest', 'setLoading'],
            },
            SET_MAX_GAS_FEE: {
              actions: ['setMaxGasFee', 'sendRequest', 'setLoading'],
            },
            REVIEW_TRANSACTION: {
              cond: 'isReviewable',
              target: 'review',
            },
            REMOVE_TRIGGER: {
              actions: ['setRemoveAction'],
              cond: 'canRemove',
              target: 'remove',
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
        remove: {
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
          on: {
            RESET: {
              target: 'idle',
            },
          },
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
          actions: ['updateTriggerResponse', 'setNotLoading', 'getGasEstimation'],
        },
        GAS_ESTIMATION_UPDATED: {
          actions: ['updateGasEstimation'],
        },
        GO_TO_EDITING: {
          target: 'editing',
        },
        CURRENT_TRIGGER_RECEIVED: {
          actions: ['updateCurrentTrigger'],
        },
        SIGNER_UPDATED: {
          actions: ['updateSigner'],
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
            (context.setupTriggerResponse.errors ?? []).length === 0 &&
            context.gasEstimation.gasEstimationStatus === GasEstimationStatus.calculated
          )
        },
        canRemove: (context) => {
          return context.currentTrigger !== undefined
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
        setPrice: assign((_, event) => ({
          price: event.price,
        })),
        setUsePrice: assign((context, event) => ({
          usePrice: event.enabled,
          price: event.enabled ? context.price : undefined,
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
              price: context.price,
              maxGasFee: context.maxGasFee,
              usePrice: context.usePrice,
              action: context.action,
            },
          }),
        ),
        getGasEstimation: sendTo(
          'gasEstimation',
          (context, event): InternalGasEstimationEvent => ({
            type: 'INTERNAL_GAS_ESTIMATION',
            params: {
              ...context,
              setupTriggerResponse: event.setupTriggerResponse,
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
        updateCurrentTrigger: assign((_, event) => {
          if (event.currentTrigger) {
            return {
              currentTrigger: event.currentTrigger,
              action: TriggerAction.Update,
            }
          }
          return {
            currentTrigger: undefined,
            action: TriggerAction.Add,
          }
        }),
        updateSigner: assign((_, event) => ({
          signer: event.signer,
        })),
        setRemoveAction: assign(() => ({
          action: TriggerAction.Remove,
        })),
      },
      services: {
        getParameters: (context) => (callback, onReceive) => {
          const machine = interpret(createDebouncingMachine(action), {
            id: `${automationFeature}ParametersDebounceMachine`,
          }).start()

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
              const request: SetupAaveBasicAutomationParams = {
                dpm: event.params.position.dpm,
                executionLTV: new BigNumber(event.params.executionTriggerLTV).times(10 ** 2),
                targetLTV: new BigNumber(event.params.targetTriggerLTV).times(10 ** 2),
                price: event.params.price?.times(10 ** 8),
                usePrice: event.params.usePrice,
                maxBaseFee: new BigNumber(event.params.maxGasFee),
                protocol: LendingProtocol.AaveV3,
                triggerType: triggerType,
                strategy: {
                  collateralAddress: event.params.position.collateral.token.address,
                  debtAddress: event.params.position.debt.token.address,
                },
                networkId: context.networkId,
                action: event.params.action,
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

              let gas: string = ''
              let fee: TransactionFee | undefined = undefined

              try {
                gas = await estimateGas({
                  ...setupTriggerResponse.transaction,
                  signer,
                  networkId,
                  proxyAddress: position.dpm,
                })

                fee = await getTransactionFee({ estimatedGas: gas, networkId })
              } catch (error) {
                console.error(error)

                callback({
                  type: 'GAS_ESTIMATION_UPDATED',
                  gasEstimation: {
                    gasEstimationStatus: GasEstimationStatus.error,
                  },
                })
              }

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
            extract: () => {},
          })

          const actor = interpret(machine, {
            id: `${automationFeature}EthersTransactionMachine`,
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

export const autoBuyTriggerAaveStateMachine = getBasicAutomationAaveStateMachine<AaveBasicBuy>(
  AutomationFeatures.AUTO_BUY,
  setupAaveAutoBuy,
  119,
)

export const autoSellTriggerAaveStateMachine = getBasicAutomationAaveStateMachine<AaveBasicSell>(
  AutomationFeatures.AUTO_SELL,
  setupAaveAutoSell,
  120,
)
export type AutoBuyTriggerAaveContext = BasicAutomationAaveContext<AaveBasicBuy>
export type AutoSellTriggerAaveContext = BasicAutomationAaveContext<AaveBasicSell>
export type AutoBuyTriggerAaveEvent = BasicAutomationAaveEvent<AaveBasicBuy>
export type AutoSellTriggerAaveEvent = BasicAutomationAaveEvent<AaveBasicSell>
