import { IRiskRatio, IStrategy } from '@oasisdex/oasis-actions'
import { trackingEvents } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { ActorRefFrom, assign, createMachine, send, StateFrom } from 'xstate'
import { cancel } from 'xstate/lib/actions'
import { MachineOptionsFrom } from 'xstate/lib/types'

import { OperationExecutorTxMeta } from '../../../../blockchain/calls/operationExecutor'
import { allDefined } from '../../../../helpers/allDefined'
import { HasGasEstimation } from '../../../../helpers/form'
import { zero } from '../../../../helpers/zero'
import { ProxyStateMachine } from '../../../proxyNew/state'
import { TransactionStateMachine } from '../../../stateMachines/transaction'
import { BaseAaveContext, BaseAaveEvent, IStrategyInfo } from '../../common/BaseAaveContext'
import { StrategyConfig } from '../../common/StrategyConfigTypes'
import { ParametersStateMachine, ParametersStateMachineEvents } from './parametersStateMachine'

const STEPS_WITHOUT_PROXY_CREATION = 3
export const STEPS_WITH_PROXY_CREATION = 5

export interface OpenAaveContext extends BaseAaveContext {
  refParametersStateMachine?: ActorRefFrom<ParametersStateMachine>
  refProxyMachine?: ActorRefFrom<ProxyStateMachine>
  refTransactionMachine?: ActorRefFrom<TransactionStateMachine<OperationExecutorTxMeta>>

  auxiliaryAmount?: BigNumber
  strategyName?: string
  hasOtherAssetsThanETH_STETH?: boolean
  strategyConfig: StrategyConfig
  preexistingProxy: boolean
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
  | { type: 'RESET_RISK_RATIO' }

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
  | BaseAaveEvent

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
    entry: ['spawnParametersMachine', 'spawnPricesObservable', 'spawnUserSettingsObservable'],
    states: {
      editing: {
        entry: ['resetCurrentStep'],
        on: {
          SET_AMOUNT: {
            actions: [
              'setAmount',
              'calculateAuxiliaryAmount',
              'debounceSendingToParametersMachine',
              'sendUpdateToParametersMachine',
              'setIsLoadingTrue',
            ],
          },
          NEXT_STEP: [
            { cond: 'emptyProxyAddress', target: 'proxyCreating', actions: 'incrementCurrentStep' },
            { cond: 'enoughBalance', target: 'settingMultiple', actions: 'incrementCurrentStep' },
          ],
          TRANSACTION_PARAMETERS_RECEIVED: {
            actions: ['setIsLoadingFalse', 'assignTransactionParameters'],
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
              'sendUpdateToParametersMachine',
              'setIsLoadingTrue',
            ],
          },
          RESET_RISK_RATIO: {
            actions: [
              'resetRiskRatio',
              'debounceSendingToParametersMachine',
              'sendUpdateToParametersMachine',
              'setIsLoadingTrue',
            ],
          },
          TRANSACTION_PARAMETERS_RECEIVED: {
            actions: ['assignTransactionParameters', 'setIsLoadingFalse'],
          },
          NEXT_STEP: {
            target: 'reviewing',
            cond: 'validTransactionParameters',
            actions: 'incrementCurrentStep',
          },
          BACK_TO_EDITING: {
            target: 'editing',
            actions: 'decrementCurrentStep',
          },
        },
        onEntry: ['eventConfirmDeposit'],
      },
      reviewing: {
        entry: ['sendUpdateToParametersMachine', 'eventConfirmRiskRatio'],
        on: {
          NEXT_STEP: {
            target: 'txInProgress',
            cond: 'validTransactionParameters',
          },
          BACK_TO_EDITING: {
            target: 'editing',
            actions: 'decrementCurrentStep',
          },
          TRANSACTION_PARAMETERS_RECEIVED: {
            actions: ['assignTransactionParameters'],
          },
        },
      },

      txInProgress: {
        entry: ['spawnTransactionMachine', 'eventConfirmTransaction'],
        on: {
          POSITION_OPENED: {
            target: 'txSuccess',
          },
          TRANSACTION_FAILED: {
            target: 'txFailure',
            actions: ['assignError'],
          },
        },
      },
      txFailure: {
        on: {
          RETRY: {
            target: 'reviewing',
          },
          BACK_TO_EDITING: {
            target: 'editing',
          },
        },
      },
      txSuccess: {
        type: 'final',
      },
    },
    on: {
      PRICES_RECEIVED: {
        actions: ['setPricesFromEvent'],
      },
      USER_SETTINGS_CHANGED: {
        actions: ['setUserSettingsFromEvent'],
      },
      SET_BALANCE: {
        actions: ['setTokenBalanceFromEvent'],
      },
      PROXY_ADDRESS_RECEIVED: {
        actions: [
          'assignProxyAddress',
          'adjustStepsForPreexistingProxy',
          'sendUpdateToParametersMachine',
        ],
      },
    },
  },
  {
    guards: {
      emptyProxyAddress: ({ proxyAddress }) => !allDefined(proxyAddress),
      validTransactionParameters: ({ userInput, proxyAddress, transactionParameters, loading }) =>
        allDefined(userInput, proxyAddress, transactionParameters) && loading === false,
      enoughBalance: ({ tokenBalance, userInput }) =>
        allDefined(tokenBalance, userInput.amount) && tokenBalance!.gt(userInput.amount!),
    },
    actions: {
      setTokenBalanceFromEvent: assign((context, event) => ({
        tokenBalance: event.balance,
        tokenPrice: event.tokenPrice,
      })),
      sendUpdateToParametersMachine: send(
        (context): ParametersStateMachineEvents => {
          return {
            type: 'VARIABLES_RECEIVED',
            amount: context.userInput?.amount!,
            riskRatio: context.userInput.riskRatio || context.strategyConfig.riskRatios.default,
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
      setIsLoadingTrue: assign((context) =>
        // no spinner before user has the proxy (otherwise it will be stuck there forever)
        context.proxyAddress ? { loading: true } : { loading: false },
      ),
      setIsLoadingFalse: assign((_) => ({ loading: false })),
      setRiskRatio: assign((context, event) => {
        return {
          userInput: {
            ...context.userInput,
            riskRatio: event.riskRatio,
          },
        }
      }),
      resetRiskRatio: assign((context) => {
        return {
          userInput: {
            ...context.userInput,
            riskRatio: context.strategyConfig.riskRatios.default,
          },
        }
      }),
      adjustStepsForPreexistingProxy: assign((_) => {
        return {
          totalSteps: STEPS_WITHOUT_PROXY_CREATION,
          preexistingProxy: true,
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
      resetCurrentStep: assign((context) => {
        let firstStep: number
        if (context.preexistingProxy) {
          firstStep = 1
        } else if (context.proxyAddress) {
          firstStep = 3
        } else {
          firstStep = 1
        }
        return {
          currentStep: firstStep,
        }
      }),
      incrementCurrentStep: assign((context) => ({
        currentStep: context.currentStep + 1,
      })),
      decrementCurrentStep: assign((context) => ({
        currentStep: context.currentStep - 1,
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

      debounceSendingToParametersMachine: cancel('update-parameters-machine'),
      eventConfirmDeposit: ({ userInput }) => {
        userInput.amount && trackingEvents.earn.stETHOpenPositionConfirmDeposit(userInput.amount)
      },
      eventConfirmRiskRatio: ({ userInput }) => {
        userInput.amount &&
          userInput.riskRatio?.loanToValue &&
          trackingEvents.earn.stETHOpenPositionConfirmRisk(
            userInput.amount,
            userInput.riskRatio.loanToValue,
          )
      },
      eventConfirmTransaction: ({ userInput }) => {
        userInput.amount &&
          userInput.riskRatio?.loanToValue &&
          trackingEvents.earn.stETHOpenPositionConfirmTransaction(
            userInput.amount,
            userInput.riskRatio.loanToValue,
          )
      },
      setPricesFromEvent: assign((context, event) => ({
        collateralPrice: event.collateralPrice,
      })),
      setUserSettingsFromEvent: assign((context, event) => ({
        slippage: event.userSettings.slippage,
      })),
      assignError: assign((_, event) => ({
        error: event.error,
      })),
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
