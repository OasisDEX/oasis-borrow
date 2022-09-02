import BigNumber from 'bignumber.js'
import { ActorRefFrom, assign, createMachine, send, StateFrom } from 'xstate'
import { cancel } from 'xstate/lib/actions'
import { MachineOptionsFrom } from 'xstate/lib/types'

import { HasGasEstimation } from '../../../../../helpers/form'
import { zero } from '../../../../../helpers/zero'
import { OperationParameters } from '../../../../aave'
import { ProxyStateMachine } from '../../../../proxyNew/state'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import { OpenAavePositionData } from '../pipelines/openAavePosition'
import {
  AaveStEthSimulateStateMachine,
  AaveStEthSimulateStateMachineEvents,
} from './aaveStEthSimulateStateMachine'
import { ParametersStateMachine, ParametersStateMachineEvents } from './parametersStateMachine'

export interface OpenAaveContext {
  multiply: BigNumber
  token: string
  inputDelay: number

  refParametersStateMachine?: ActorRefFrom<ParametersStateMachine>
  refProxyMachine?: ActorRefFrom<ProxyStateMachine>
  refTransactionMachine?: ActorRefFrom<TransactionStateMachine<OpenAavePositionData>>
  refSimulationMachine?: ActorRefFrom<AaveStEthSimulateStateMachine>

  currentStep?: number
  totalSteps?: number
  tokenBalance?: BigNumber
  amount?: BigNumber
  tokenPrice?: BigNumber
  auxiliaryAmount?: BigNumber
  proxyAddress?: string
  strategyName?: string

  transactionParameters?: OperationParameters
  estimatedGasPrice?: HasGasEstimation
}
export type OpenAaveMachineEvents =
  | { type: 'SET_AMOUNT'; amount: BigNumber }
  | { type: 'SET_BALANCE'; balance: BigNumber; tokenPrice: BigNumber }
  | { type: 'POSITION_OPENED' }
  | { type: 'NEXT_STEP' }

export type OpenAaveTransactionEvents =
  | {
      type: 'TRANSACTION_PARAMETERS_RECEIVED'
      parameters: OperationParameters
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
            { cond: 'enoughBalance', target: 'reviewing' },
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
      emptyProxyAddress: ({ proxyAddress }) => proxyAddress === undefined,
      validTransactionParameters: ({ amount, proxyAddress, transactionParameters }) =>
        amount !== undefined && proxyAddress !== undefined && transactionParameters !== undefined,
      enoughBalance: ({ tokenBalance, amount }) =>
        tokenBalance !== undefined && amount !== undefined && tokenBalance.gt(amount),
    },
    actions: {
      initContextValues: assign((context) => ({
        currentStep: 1,
        totalSteps: context.proxyAddress ? 2 : 3,
        multiply: new BigNumber(2),
        token: 'ETH',
        inputDelay: 1000,
      })),
      setTokenBalanceFromEvent: assign((context, event) => ({
        tokenBalance: event.balance,
        tokenPrice: event.tokenPrice,
      })),
      setReceivedProxyAddress: assign((context, event) => ({
        proxyAddress: event.proxyAddress,
      })),
      sendUpdateToParametersMachine: send(
        (context): ParametersStateMachineEvents => ({
          type: 'VARIABLES_RECEIVED',
          amount: context.amount!,
          multiply: context.multiply,
          token: context.token,
          proxyAddress: context.proxyAddress,
        }),
        {
          to: (context) => context.refParametersStateMachine!,
          delay: (context) => context.inputDelay,
          id: 'update-parameters-machine',
        },
      ),
      updateTotalSteps: assign((context) => ({
        totalSteps: context.proxyAddress ? 2 : 3,
      })),
      setAmount: assign((context, event) => ({
        amount: event.amount,
      })),
      calculateAuxiliaryAmount: assign((context) => ({
        auxiliaryAmount: context.amount?.times(context.tokenPrice || zero),
      })),
      assignProxyAddress: assign((_, event) => ({
        proxyAddress: event.proxyAddress,
      })),
      setCurrentStepToTwo: assign((_) => ({
        currentStep: 2,
      })),
      assignTransactionParameters: assign((context, event) => ({
        transactionParameters: event.parameters,
        estimatedGasPrice: event.estimatedGasPrice,
      })),
      sendFeesToSimulationMachine: send(
        (context): AaveStEthSimulateStateMachineEvents => ({
          type: 'FEE_CHANGED',
          fee: context.transactionParameters?.positionInfo.fee || zero,
        }),
        { to: (context) => context.refSimulationMachine! },
      ),
      sendUpdateToSimulationMachine: send(
        (context): AaveStEthSimulateStateMachineEvents => ({
          type: 'USER_PARAMETERS_CHANGED',
          amount: context.amount || zero,
          multiply: context.multiply,
          token: context.token,
        }),
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
