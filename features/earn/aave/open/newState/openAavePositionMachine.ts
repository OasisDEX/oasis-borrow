import BigNumber from 'bignumber.js'
import { Actor, createMachine } from 'xstate'

import { HasGasEstimation } from '../../../../../helpers/form'
import { OpenPositionResult } from '../../../../aave'
import { ProxyStateMachine } from '../../../../proxyNew/state'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import { OpenAavePositionData } from '../pipelines/openAavePosition'
import { OpenAaveParametersStateMachineType } from '../transaction'

export const openAaveStateMachine = createMachine({
  // predictableActionArguments: true,
  tsTypes: {} as import('./openAavePositionMachine.typegen').Typegen0,
  schema: {
    context: {} as {
      multiply: number
      token: string
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

      proxyMachine: Actor<ProxyStateMachine>
      transactionParametersMachine: Actor<OpenAaveParametersStateMachineType>
      transactionMachine: Actor<TransactionStateMachine<OpenAavePositionData>>
    },
    events: {} as
      | { type: 'SET_AMOUNT'; amount: BigNumber }
      | { type: 'SET_BALANCE'; balance: BigNumber; tokenPrice: BigNumber }
      | { type: 'PROXY_ADDRESS_RECEIVED'; proxyAddress?: string }
      | { type: 'NEXT_STEP' }
      | { type: 'BACK_TO_EDITING' }
      | {
          type: 'TRANSACTION_PARAMETERS_RECEIVED'
          transactionParameters: unknown
        },
  },
  id: 'openingAavePosition',
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
          id: 'proxyAddress',
        },
      ],
      on: {
        SET_BALANCE: {
          actions: 'setTokenBalance',
        },
        SET_AMOUNT: {
          actions: ['setAmount', 'calculateAuxiliaryAmount', 'sendUpdateToParametersMachine'],
        },
        TRANSACTION_PARAMETERS_RECEIVED: {
          actions: 'updateTransactionParameters',
        },
        NEXT_STEP: [
          {
            cond: 'emptyProxyAddress',
            target: 'proxyCreating',
          },
          {
            cond: 'enoughBalance',
            target: 'reviewing',
          },
        ],
      },
    },
    proxyCreating: {
      invoke: {
        src: 'spawnProxyMachine',
        id: 'proxy',
        onDone: [
          {
            actions: 'assignProxyAddress',
            target: 'editing',
          },
        ],
      },
    },
    reviewing: {
      entry: 'sendUpdateToParametersMachine',
      on: {
        TRANSACTION_PARAMETERS_RECEIVED: {
          actions: 'updateTransactionParameters',
        },
        NEXT_STEP: {
          cond: 'validTransactionParameters',
          target: 'txInProgress',
        },
      },
    },
    txInProgress: {
      invoke: {
        src: 'spawnTransactionMachine',
        id: 'transaction',
        onDone: [
          {
            actions: 'assignPositionNumber',
            target: 'txSuccess',
          },
        ],
        onError: [
          {
            actions: 'logError',
            target: 'txFailure',
          },
        ],
      },
    },
    txFailure: {
      on: {
        NEXT_STEP: {
          target: 'reviewing',
        },
      },
    },
    txSuccess: {
      type: 'final',
    },
  },
})
