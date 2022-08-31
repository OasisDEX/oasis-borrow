import BigNumber from 'bignumber.js'
import { ActorRefFrom, assign, createMachine, send } from 'xstate'
import { MachineOptionsFrom } from 'xstate/lib/types'

import { HasGasEstimation } from '../../../../../helpers/form'
import { zero } from '../../../../../helpers/zero'
import { OpenPositionResult } from '../../../../aave'
import { ProxyStateMachine } from '../../../../proxyNew/state'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import {
  CommonMachineEvents,
  ProxyMachineEvents,
  TransactionMachineEvents,
} from '../../common/state/types'
import { OpenAavePositionData } from '../pipelines/openAavePosition'
import {
  OpenAaveParametersStateMachine,
  OpenAaveParametersStateMachineEvents,
} from '../transaction/openAaveParametersStateMachine'

export interface OpenAaveContext {
  multiply: number
  token: string

  refParametersStateMachine?: ActorRefFrom<OpenAaveParametersStateMachine>
  refProxyMachine?: ActorRefFrom<ProxyStateMachine>
  refTransactionMachine?: ActorRefFrom<TransactionStateMachine<OpenAavePositionData>>

  currentStep?: number
  totalSteps?: number
  tokenBalance?: BigNumber
  amount?: BigNumber
  tokenPrice?: BigNumber
  auxiliaryAmount?: BigNumber
  proxyAddress?: string
  vaultNumber?: BigNumber
  strategyName?: string

  transactionParameters?: OpenPositionResult
  estimatedGasPrice?: HasGasEstimation
}
export type OpenAaveMachineEvents =
  | { type: 'SET_AMOUNT'; amount: BigNumber }
  | { type: 'SET_BALANCE'; balance: BigNumber; tokenPrice: BigNumber }
  | { type: 'POSITION_OPENED' }
  | { type: 'NEXT_STEP' }

export type OpenAaveTransactionEvents =
  | { type: 'TRANSACTION_PARAMETERS_RECEIVED'; parameters: OpenPositionResult }
  | { type: 'TRANSACTION_PARAMETERS_CHANGED'; amount: BigNumber; multiply: number; token: string }

export type OpenAaveEvent =
  | ProxyMachineEvents
  | TransactionMachineEvents
  | CommonMachineEvents
  | OpenAaveMachineEvents
  | OpenAaveTransactionEvents

export const createOpenAaveStateMachine = createMachine(
  {
    predictableActionArguments: true,
    strict: true,
    tsTypes: {} as import('./machine.typegen').Typegen0,
    schema: {
      context: {} as OpenAaveContext,
      events: {} as OpenAaveEvent,
    },
    key: 'aaveOpen',
    initial: 'editing',
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
            actions: [
              'setReceivedProxyAddress',
              'updateTotalSteps',
              'sendUpdateToParametersMachine',
            ],
          },
          SET_AMOUNT: {
            actions: ['setAmount', 'calculateAuxiliaryAmount', 'sendUpdateToParametersMachine'],
          },
          NEXT_STEP: [
            { cond: 'emptyProxyAddress', target: 'proxyCreating' },
            { cond: 'enoughBalance', target: 'reviewing' },
          ],
          TRANSACTION_PARAMETERS_RECEIVED: {
            actions: ['assignTransactionParameters'],
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
      })),
      setTokenBalanceFromEvent: assign((context, event) => ({
        tokenBalance: event.balance,
        tokenPrice: event.tokenPrice,
      })),
      setReceivedProxyAddress: assign((context, event) => ({
        proxyAddress: event.proxyAddress,
      })),
      sendUpdateToParametersMachine: send(
        (context): OpenAaveParametersStateMachineEvents => ({
          type: 'VARIABLES_RECEIVED',
          amount: context.amount!,
          multiply: context.multiply,
          token: context.token,
          proxyAddress: context.proxyAddress,
        }),
        { to: (context) => context.refParametersStateMachine! },
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

export type OpenAaveStateMachineState = OpenAaveStateMachine['initialState']
