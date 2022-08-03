import { Machine } from 'xstate'

import { actions, openAaveMachineActions } from './actions'
import { emptyProxyAddress, enoughBalance } from './guards'
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
            actions: [actions.setReceivedProxyAddress, actions.updateTotalSteps],
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
            cond: emptyProxyAddress,
          },
          CONFIRM_DEPOSIT: {
            target: 'reviewing',
            cond: enoughBalance,
          },
          'xstate.update': {
            actions: [actions.getTransactionParametersFromParametersMachine],
          },
        },
      },
      proxyCreating: {
        invoke: {
          src: services.invokeProxyMachine,
          id: services.invokeProxyMachine,
          description: 'Create a proxy if one does not exist.',
          onDone: {
            target: 'editing',
            actions: [actions.getProxyAddressFromProxyMachine],
          },
        },
      },
      reviewing: {
        entry: [actions.setCurrentStepToTwo],
        on: {
          START_CREATING_POSITION: {
            target: 'txInProgress',
          },
          BACK_TO_EDITING: {
            target: 'editing',
          },
        },
      },

      txInProgress: {
        invoke: {
          src: services.createPosition,
          id: services.createPosition,
          description: 'Invoking transaction on blockchain.',
          onDone: 'txSuccess',
          onError: 'txFailure',
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
      [services.invokeProxyMachine]: () => {
        throw new Error('invokeProxyMachine not implemented. Pass it via config')
      },
      [services.createPosition]: () => {
        throw new Error('createPosition not implemented. Pass it via config')
      },
    },
  },
)
