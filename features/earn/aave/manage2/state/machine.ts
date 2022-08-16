import { Machine } from 'xstate'
import { log } from 'xstate/lib/actions'

import { actions, manageAaveMachineActions } from './actions'
import { validTransactionParameters } from './guards'
import { services } from './services'
import { ManageAaveContext, ManageAaveEvent } from './types'

export interface ManageAaveStateMachineSchema {
  states: {
    reviewing: {}
    txInProgress: {}
    txFailure: {}
    txSuccess: {}
  }
}

// TODO: Revert initial state to editing once editing state is available
export const createManageAaveStateMachine = Machine<
  ManageAaveContext,
  ManageAaveStateMachineSchema,
  ManageAaveEvent
>(
  {
    key: 'aaveManage',
    initial: 'reviewing',
    states: {
      reviewing: {
        entry: [
          // actions.setCurrentStepToTwo,
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
      ...manageAaveMachineActions,
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
