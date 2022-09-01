import BigNumber from 'bignumber.js'
import { ActorRefFrom, assign, createMachine, send, StateFrom } from 'xstate'
import { MachineOptionsFrom } from 'xstate/lib/types'

import { HasGasEstimation } from '../../../../../helpers/form'
import { OperationParameters } from '../../../../aave'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import { ParametersStateMachine, ParametersStateMachineEvents } from '../../open/state'
import { ManageAavePositionData } from '../pipelines/manageAavePosition'

export interface ManageAaveContext {
  token: string
  multiply: BigNumber
  inputDelay: number
  amount: BigNumber
  auxiliaryAmount?: BigNumber

  refParametersStateMachine?: ActorRefFrom<ParametersStateMachine> // For now, it's the same as in open flow. But when the library will be ready it will be different.
  refTransactionStateMachine?: ActorRefFrom<TransactionStateMachine<ManageAavePositionData>>

  currentStep?: number
  totalSteps?: number
  tokenBalance?: BigNumber
  proxyAddress?: string
  strategyName?: string

  transactionParameters?: OperationParameters
  estimatedGasPrice?: HasGasEstimation
}

export type ManageAaveMachineEvents =
  | {
      readonly type: 'POSITION_CLOSED'
    }
  | {
      readonly type: 'START_ADJUSTING_POSITION'
    }
  | {
      readonly type: 'START_CLOSING_POSITION'
    }
  | { type: 'SET_BALANCE'; balance: BigNumber; tokenPrice: BigNumber }
  | { type: 'NEXT_STEP' }
  | { type: 'BACK_TO_EDITING' }
  | { type: 'RETRY' }

export type ManageAaveTransactionEvents =
  | {
      type: 'TRANSACTION_PARAMETERS_RECEIVED'
      parameters: OperationParameters
      estimatedGasPrice: HasGasEstimation
    }
  | {
      readonly type: 'TRANSACTION_PARAMETERS_CHANGED'
      readonly amount: BigNumber
      readonly multiply: number
      readonly token: string
    }

export type ManageAaveEvent =
  | {
      readonly type: 'PROXY_ADDRESS_RECEIVED'
      readonly proxyAddress: string | undefined
    }
  | ManageAaveMachineEvents
  | ManageAaveTransactionEvents

export const createManageAaveStateMachine = createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    strict: true,
    tsTypes: {} as import('./manageAaveStateMachine.typegen').Typegen0,
    key: 'aaveManage',
    initial: 'editing',
    schema: {
      context: {} as ManageAaveContext,
      events: {} as ManageAaveEvent,
    },
    states: {
      editing: {
        entry: ['initContextValues', 'spawnParametersMachine'],
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
            actions: ['setReceivedProxyAddress', 'sendUpdateToParametersMachine'],
          },
          NEXT_STEP: { target: 'reviewing' },
        },
      },
      reviewing: {
        entry: ['sendUpdateToParametersMachine'],
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
          POSITION_CLOSED: {
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
      validTransactionParameters: ({ proxyAddress, transactionParameters }: ManageAaveContext) => {
        return proxyAddress !== undefined && transactionParameters !== undefined
      },
    },
    actions: {
      initContextValues: assign((_) => ({
        currentStep: 1,
        totalSteps: 2,
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
      assignTransactionParameters: assign((context, event) => ({
        transactionParameters: event.parameters,
        estimatedGasPrice: event.estimatedGasPrice,
      })),
    },
  },
)

class ManageAaveStateMachineTypes {
  needsConfiguration() {
    return createManageAaveStateMachine
  }
  withConfig() {
    // @ts-ignore
    return createManageAaveStateMachine.withConfig({})
  }
}

export type ManageAaveStateMachineWithoutConfiguration = ReturnType<
  ManageAaveStateMachineTypes['needsConfiguration']
>
export type ManageAaveStateMachine = ReturnType<ManageAaveStateMachineTypes['withConfig']>

export type ManageAaveStateMachineServices = MachineOptionsFrom<
  ManageAaveStateMachineWithoutConfiguration,
  true
>['services']

export type ManageAaveStateMachineState = StateFrom<ManageAaveStateMachine>
