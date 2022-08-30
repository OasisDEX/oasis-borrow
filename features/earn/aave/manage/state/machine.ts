import { Machine } from 'xstate'
import { log } from 'xstate/lib/actions'

import { actions, manageAaveMachineActions } from './actions'
import { validCloseTransactionParameters, validTransactionParameters } from './guards'
import { services } from './services'
import { ManageAaveContext, ManageAaveEvent } from './types'

export interface ManageAaveStateMachineSchema {
  states: {
    editing: {}
    reviewing: {}
    txInProgress: {}
    txFailure: {}
    txSuccess: {}
  }
}

export const createManageAaveStateMachine = Machine<
  ManageAaveContext,
  ManageAaveStateMachineSchema,
  ManageAaveEvent
>(
  {
    key: 'aaveManage',
    initial: 'editing',
    states: {
      editing: {
        entry: [actions.initContextValues, actions.spawnParametersMachine],
        invoke: [
          // {
          //   src: services.getBalance,
          //   id: services.getBalance,
          // },
          {
            src: services.getProxyAddress,
            id: services.getProxyAddress,
          },
        ],
        on: {
          // SET_BALANCE: {
          //   actions: [actions.setTokenBalanceFromEvent],
          // },
          PROXY_ADDRESS_RECEIVED: {
            actions: [
              actions.setReceivedProxyAddress,
              actions.updateTotalSteps,
              actions.sendUpdateToParametersMachine,
            ],
          },
          POSITION_CLOSED: {
            target: 'reviewing',
          },
          'xstate.update': {
            actions: [
              actions.getTransactionParametersFromParametersMachine,
              actions.updateTransactionParameters,
            ],
          },
        },
      },
      reviewing: {
        entry: [actions.sendUpdateToParametersMachine, actions.spawnTransactionMachine],
        on: {
          START_ADJUSTING_POSITION: {
            target: 'txInProgress',
            cond: validTransactionParameters,
          },
          START_CLOSING_POSITION: {
            target: 'txInProgress',
            cond: validCloseTransactionParameters,
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
            actions: [() => console.log('tx was successful')],
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
      ...manageAaveMachineActions,
    },
    services: {
      [services.getProxyAddress]: () => {
        throw new Error('getProxyAddress not implemented. Pass it via config')
      },
      // [services.getBalance]: () => {
      //   throw new Error('getBalance not implemented. Pass it via config')
      // },
    },
  },
)
