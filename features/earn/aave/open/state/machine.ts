import { Machine } from 'xstate'
import { log } from 'xstate/lib/actions'

import { actions, openAaveMachineActions } from './actions'
import { emptyProxyAddress, enoughBalance, validTransactionParameters } from './guards'
import { services } from './services'
import { OpenAaveContext, OpenAaveEvent } from './types'

export interface OpenAaveStateMachineSchema {
  states: {
    editing: {}
    proxyCreating: {}
    reviewing: {}
    txInProgress: {}
    txFailure: {}
    txSuccess: {}
  }
}

export const createOpenAaveStateMachine = Machine<
  OpenAaveContext,
  OpenAaveStateMachineSchema,
  OpenAaveEvent
>(
  {
    key: 'aaveOpen',
    initial: 'editing',
    states: {
      editing: {
        entry: [actions.initContextValues, actions.spawnParametersMachine],
        invoke: [
          {
            src: services.getBalance,
            id: services.getBalance,
          },
          {
            src: services.getProxyAddress,
            id: services.getProxyAddress,
          },
        ],
        on: {
          SET_BALANCE: {
            actions: [actions.setTokenBalanceFromEvent],
          },
          PROXY_ADDRESS_RECEIVED: {
            actions: [
              actions.setReceivedProxyAddress,
              actions.updateTotalSteps,
              actions.sendUpdateToParametersMachine,
            ],
          },
          SET_AMOUNT: {
            actions: [
              actions.setAmount,
              actions.calculateAuxiliaryAmount,
              actions.sendUpdateToParametersMachine,
            ],
          },
          CREATE_PROXY: {
            target: 'proxyCreating',
            actions: [actions.spawnProxyMachine],
            cond: emptyProxyAddress,
          },
          CONFIRM_DEPOSIT: {
            target: 'reviewing',
            cond: enoughBalance,
          },
          'xstate.update': {
            actions: [
              actions.getTransactionParametersFromParametersMachine,
              actions.updateTransactionParameters,
            ],
          },
        },
      },
      proxyCreating: {
        on: {
          'done.invoke.proxy': {
            target: 'editing',
            actions: [actions.getProxyAddressFromProxyMachine],
          },
          'error.platform.proxy': {
            target: 'editing',
          },
        },
      },
      reviewing: {
        entry: [
          actions.setCurrentStepToTwo,
          actions.sendUpdateToParametersMachine,
          actions.spawnTransactionMachine,
        ],
        on: {
          START_CREATING_POSITION: {
            target: 'txInProgress',
            cond: validTransactionParameters,
          },
          BACK_TO_EDITING: {
            target: 'editing',
          },
          'xstate.update': {
            actions: [
              log('update parameters'),
              actions.getTransactionParametersFromParametersMachine,
              actions.updateTransactionParameters,
            ],
          },
        },
      },

      txInProgress: {
        entry: [actions.updateTransactionParameters, actions.startTransaction],
        on: {
          'done.invoke.transaction': {
            target: 'txSuccess',
          },
          'error.platform.transaction': {
            target: 'txFailure',
            actions: [actions.logError],
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
    guards: {},
    actions: {
      ...openAaveMachineActions,
    },
    services: {
      [services.getProxyAddress]: () => {
        throw new Error('getProxyAddress not implemented. Pass it via config')
      },
      [services.getBalance]: () => {
        throw new Error('getBalance not implemented. Pass it via config')
      },
    },
  },
)
