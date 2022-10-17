import { IRiskRatio, IStrategy } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { ActorRefFrom, assign, createMachine, send, StateFrom } from 'xstate'
import { cancel } from 'xstate/lib/actions'
import { MachineOptionsFrom } from 'xstate/lib/types'

import { OperationExecutorTxMeta } from '../../../../../blockchain/calls/operationExecutor'
import { allDefined } from '../../../../../helpers/allDefined'
import { HasGasEstimation } from '../../../../../helpers/form'
import { zero } from '../../../../../helpers/zero'
import { ProxyStateMachine } from '../../../../proxyNew/state'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import { BaseAaveContext, IStrategyInfo } from '../../common/BaseAaveContext'
import { aaveStETHMinimumRiskRatio } from '../../constants'
import {
  AaveStEthSimulateStateMachine,
  AaveStEthSimulateStateMachineEvents,
} from './aaveStEthSimulateStateMachine'
import { ParametersStateMachine, ParametersStateMachineEvents } from './parametersStateMachine'

export interface OpenAaveContext extends BaseAaveContext {
  refParametersStateMachine?: ActorRefFrom<ParametersStateMachine>
  refProxyMachine?: ActorRefFrom<ProxyStateMachine>
  refTransactionMachine?: ActorRefFrom<TransactionStateMachine<OperationExecutorTxMeta>>
  refSimulationMachine?: ActorRefFrom<AaveStEthSimulateStateMachine>

  auxiliaryAmount?: BigNumber
  strategyName?: string
  hasOtherAssetsThanETH_STETH?: boolean
}

export type OpenAaveMachineEvents =
  | { type: 'SET_AMOUNT'; amount: BigNumber }
  | { type: 'SET_BALANCE'; balance: BigNumber; tokenPrice: BigNumber }
  | { type: 'POSITION_OPENED' }
  | { type: 'NEXT_STEP' }
  | { type: 'SET_RISK_RATIO'; riskRatio: IRiskRatio }
  | {
      type: 'UPDATE_STRATEGY_INFO'
      strategyInfo: IStrategyInfo
    }
  | {
      type: 'UPDATE_META_INFO'
      hasOtherAssetsThanETH_STETH: boolean
    }

export type OpenAaveTransactionEvents =
  | {
      type: 'TRANSACTION_PARAMETERS_RECEIVED'
      parameters: IStrategy
      estimatedGasPrice: HasGasEstimation
    }
  | { type: 'TRANSACTION_PARAMETERS_CHANGED'; amount: BigNumber; multiply: number; token: string }

export type OpenAaveEvent =
  | {
      readonly type: 'PROXY_ADDRESS_RECEIVED'
      readonly proxyAddress: string | undefined
    }
  | {
      readonly type: 'PROXY_CREATED'
      readonly proxyAddress: string
    }
  | { type: 'BACK_TO_EDITING' }
  | { type: 'RETRY' }
  | OpenAaveMachineEvents
  | OpenAaveTransactionEvents

export const createOpenAaveStateMachine = createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    strict: true,
    tsTypes: {} as import('./openAaveStateMachine.typegen').Typegen0,
    schema: {
      context: {} as OpenAaveContext,
      events: {} as OpenAaveEvent,
    },
    key: 'aaveOpen',
    initial: 'editing',
    states: {
      editing: {
        entry: ['initContextValues', 'spawnParametersMachine', 'spawnSimulationMachine'],
        invoke: [
          {
            src: 'getBalance',
            id: 'getBalance',
          },
          {
            src: 'getProxyAddress',
            id: 'getProxyAddress',
          },
        ],
        on: {
          SET_BALANCE: {
            actions: ['setTokenBalanceFromEvent'],
          },
          PROXY_ADDRESS_RECEIVED: {
            actions: [
              'setReceivedProxyAddress',
              'updateTotalSteps',
              'sendUpdateToParametersMachine',
            ],
          },
          SET_AMOUNT: {
            actions: [
              'setAmount',
              'calculateAuxiliaryAmount',
              'debounceSendingToParametersMachine',
              'debounceSendingToSimulationMachine',
              'sendUpdateToParametersMachine',
              'sendUpdateToSimulationMachine',
            ],
          },
          NEXT_STEP: [
            { cond: 'emptyProxyAddress', target: 'proxyCreating' },
            { cond: 'enoughBalance', target: 'settingMultiple' },
          ],
          TRANSACTION_PARAMETERS_RECEIVED: {
            actions: ['assignTransactionParameters', 'sendFeesToSimulationMachine'],
          },
        },
      },
      proxyCreating: {
        entry: ['spawnProxyMachine'],
        on: {
          PROXY_CREATED: {
            actions: ['assignProxyAddress'],
            target: 'editing',
          },
        },
      },
      settingMultiple: {
        invoke: [
          {
            src: 'getStrategyInfo',
            id: 'getStrategyInfo',
          },
          {
            src: 'getHasOtherAssets',
            id: 'getHasOtherAssets',
          },
        ],
        on: {
          UPDATE_STRATEGY_INFO: {
            actions: ['updateStrategyInfo'],
          },
          UPDATE_META_INFO: {
            actions: ['updateMetaInfo'],
          },
          SET_RISK_RATIO: {
            actions: [
              'setRiskRatio',
              'debounceSendingToParametersMachine',
              'debounceSendingToSimulationMachine',
              'sendUpdateToParametersMachine',
              'sendUpdateToSimulationMachine',
            ],
          },
          TRANSACTION_PARAMETERS_RECEIVED: {
            actions: ['assignTransactionParameters', 'sendFeesToSimulationMachine'],
          },
          NEXT_STEP: {
            target: 'reviewing',
            // TODO: validate multiple here cond: 'validTransactionParameters'
          },
          BACK_TO_EDITING: {
            target: 'editing',
          },
        },
      },
      reviewing: {
        entry: ['setCurrentStepToTwo', 'sendUpdateToParametersMachine'],
        on: {
          NEXT_STEP: {
            target: 'txInProgress',
            cond: 'validTransactionParameters',
          },
          BACK_TO_EDITING: {
            target: 'editing',
          },
          TRANSACTION_PARAMETERS_RECEIVED: {
            actions: ['assignTransactionParameters'],
          },
        },
      },

      txInProgress: {
        entry: ['spawnTransactionMachine'],
        on: {
          POSITION_OPENED: {
            target: 'txSuccess',
          },
        },
      },
      txFailure: {
        on: {
          RETRY: 'reviewing',
        },
      },
      txSuccess: {
        type: 'final',
      },
    },
  },
  {
    guards: {
      emptyProxyAddress: ({ proxyAddress }) => !allDefined(proxyAddress),
      validTransactionParameters: ({ userInput, proxyAddress, transactionParameters }) =>
        allDefined(userInput, proxyAddress, transactionParameters),
      enoughBalance: ({ tokenBalance, userInput }) =>
        allDefined(tokenBalance, userInput.amount) && tokenBalance!.gt(userInput.amount!),
    },
    actions: {
      initContextValues: assign((context) => ({
        currentStep: 1,
        totalSteps: context.proxyAddress ? 3 : 4,
        riskRatio: aaveStETHMinimumRiskRatio,
        token: 'ETH',
        inputDelay: 1000,
        strategyName: 'stETHeth',
        userInput: {},
      })),
      setTokenBalanceFromEvent: assign((context, event) => ({
        tokenBalance: event.balance,
        tokenPrice: event.tokenPrice,
      })),
      setReceivedProxyAddress: assign((context, event) => ({
        proxyAddress: event.proxyAddress,
      })),
      sendUpdateToParametersMachine: send(
        (context): ParametersStateMachineEvents => {
          return {
            type: 'VARIABLES_RECEIVED',
            amount: context.userInput?.amount!,
            riskRatio: context.userInput.riskRatio || aaveStETHMinimumRiskRatio,
            token: context.token,
            proxyAddress: context.proxyAddress,
          }
        },
        {
          to: (context) => context.refParametersStateMachine!,
          delay: (context) => context.inputDelay,
          id: 'update-parameters-machine',
        },
      ),
      setRiskRatio: assign((context, event) => {
        return {
          userInput: {
            ...context.userInput,
            riskRatio: event.riskRatio,
          },
        }
      }),
      updateTotalSteps: assign((context) => {
        return {
          totalSteps: context.proxyAddress
            ? (context.totalSteps || 0) - 1
            : context.totalSteps || 0,
        }
      }),
      setAmount: assign((context, event) => {
        return {
          userInput: {
            ...context.userInput,
            amount: event.amount,
          },
        }
      }),
      calculateAuxiliaryAmount: assign((context) => {
        return {
          auxiliaryAmount: context.userInput.amount?.times(context.tokenPrice || zero),
        }
      }),
      assignProxyAddress: assign((_, event) => ({
        proxyAddress: event.proxyAddress,
      })),
      setCurrentStepToTwo: assign((_) => ({
        currentStep: 2,
      })),
      assignTransactionParameters: assign((context, event) => {
        return {
          transactionParameters: event.parameters,
          estimatedGasPrice: event.estimatedGasPrice,
        }
      }),
      updateStrategyInfo: assign((context, event) => ({
        strategyInfo: event.strategyInfo,
      })),
      updateMetaInfo: assign((context, event) => ({
        hasOtherAssetsThanETH_STETH: event.hasOtherAssetsThanETH_STETH,
      })),
      sendFeesToSimulationMachine: send(
        (context): AaveStEthSimulateStateMachineEvents => {
          const sourceTokenFee =
            context.transactionParameters?.simulation.swap.sourceTokenFee || zero
          const targetTokenFee =
            context.transactionParameters?.simulation.swap.targetTokenFee || zero
          return {
            type: 'FEE_CHANGED',
            fee: sourceTokenFee.plus(targetTokenFee),
          }
        },
        { to: (context) => context.refSimulationMachine! },
      ),
      sendUpdateToSimulationMachine: send(
        (context): AaveStEthSimulateStateMachineEvents => {
          return {
            type: 'USER_PARAMETERS_CHANGED',
            amount: context.userInput.amount || zero,
            riskRatio: context.userInput.riskRatio || aaveStETHMinimumRiskRatio,
            token: context.token,
          }
        },
        {
          to: (context) => context.refSimulationMachine!,
          delay: (context) => context.inputDelay,
          id: 'update-simulate-machine',
        },
      ),
      debounceSendingToParametersMachine: cancel('update-parameters-machine'),
      debounceSendingToSimulationMachine: cancel('update-simulate-machine'),
    },
  },
)

class OpenAaveStateMachineTypes {
  needsConfiguration() {
    return createOpenAaveStateMachine
  }
  withConfig() {
    // @ts-ignore
    return createOpenAaveStateMachine.withConfig({})
  }
}

export type OpenAaveStateMachineWithoutConfiguration = ReturnType<
  OpenAaveStateMachineTypes['needsConfiguration']
>
export type OpenAaveStateMachine = ReturnType<OpenAaveStateMachineTypes['withConfig']>

export type OpenAaveStateMachineServices = MachineOptionsFrom<
  OpenAaveStateMachineWithoutConfiguration,
  true
>['services']

export type OpenAaveStateMachineState = StateFrom<OpenAaveStateMachine>
