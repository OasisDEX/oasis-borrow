import BigNumber from 'bignumber.js'
import { ActorRef, ActorRefFrom, assign, createMachine, send } from 'xstate'

import { HasGasEstimation } from '../../../../../helpers/form'
import { zero } from '../../../../../helpers/zero'
import { OpenPositionResult } from '../../../../aave'
import { ProxyStateMachine } from '../../../../proxyNew/state'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import { OpenAavePositionData } from '../pipelines/openAavePosition'
import { OpenAaveParametersStateMachine } from '../transaction'

export interface openContext {
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

  proxyMachine?: ActorRef<ProxyStateMachine>
  transactionParametersMachine?: ActorRefFrom<OpenAaveParametersStateMachine>
  transactionMachine?: ActorRef<TransactionStateMachine<OpenAavePositionData>>
}

export type openEvents =
  | { type: 'SET_AMOUNT'; amount: BigNumber }
  | { type: 'SET_BALANCE'; balance: BigNumber; tokenPrice: BigNumber }
  | { type: 'PROXY_ADDRESS_RECEIVED'; proxyAddress?: string }
  | { type: 'NEXT_STEP' }
  | { type: 'BACK_TO_EDITING' }
  | {
      type: 'TRANSACTION_PARAMETERS_RECEIVED'
      transactionParameters: OpenPositionResult
    }

export const openAaveStateMachine = createMachine(
  {
    predictableActionArguments: true,
    tsTypes: {} as import('./openAavePositionMachine.typegen').Typegen0,
    schema: {
      context: {} as openContext,
      events: {} as openEvents,
      services: {} as {
        spawnProxyMachine: { data: { proxyAddress: string } }
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
  },
  {
    actions: {
      assignProxyAddress: assign((context, event) => {
        return {
          proxyAddress: event.data.proxyAddress,
        }
      }),
      setTokenBalance: assign((ctx, event) => {
        return {
          tokenBalance: event.balance,
          tokenPrice: event.tokenPrice,
        }
      }),
      setAmount: assign((ctx, event) => {
        return {
          amount: event.amount,
        }
      }),
      calculateAuxiliaryAmount: assign((ctx) => ({
        auxiliaryAmount: ctx.amount?.times(ctx.tokenPrice || zero),
      })),
      sendUpdateToParametersMachine: send(
        (ctx) => ({
          type: 'SOME_EVENT',
          amount: ctx.amount,
          token: ctx.token,
          proxyAddress: ctx.proxyAddress,
        }),
        { to: (ctx) => ctx.transactionParametersMachine! },
      ),
    },
    guards: {
      emptyProxyAddress: (context) =>
        context.proxyAddress === '' || context.proxyAddress === undefined,
      enoughBalance: (context) => context.tokenBalance?.gt(context.amount || zero) || false,
      validTransactionParameters: ({ proxyAddress, transactionParameters, amount }) => {
        return (
          amount !== undefined && proxyAddress !== undefined && transactionParameters !== undefined
        )
      },
    },
  },
)
