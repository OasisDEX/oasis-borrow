import BigNumber from 'bignumber.js'
import { assign, Machine, sendUpdate } from 'xstate'
import { choose, log } from 'xstate/lib/actions'

import { HasGasEstimation } from '../../../../../helpers/form'
import { assertErrorEvent, assertEventType } from '../../../../../utils/xstate/index'
import { OpenPositionResult } from '../../../../aave/index'
enum services {
  getParameters = 'getParameters',
  estimateGas = 'estimateGas',
  estimateGasPrice = 'estimateGasPrice',
}

type ManageAaveParametersStateMachineContext = {
  readonly hasParent: boolean | false

  token?: string
  amount?: BigNumber
  multiply?: number
  proxyAddress?: string
  transactionParameters?: OpenPositionResult
  estimatedGas?: number
  gasPriceEstimation?: HasGasEstimation
}

export type ManageAaveParametersStateMachineEvents =
  | {
      type: 'VARIABLES_RECEIVED'
      readonly token: string
      readonly amount: BigNumber
      readonly multiply: number
      readonly proxyAddress?: string
    }
  | {
      type: 'done.invoke.getParameters'
      data: OpenPositionResult
    }
  | {
      type: 'done.invoke.estimateGas'
      data: number
    }
  | {
      type: 'done.invoke.estimateGasPrice'
      data: HasGasEstimation
    }

type ManageAaveParametersStateMachineSchema = {
  states: {
    idle: {}
    gettingParameters: {}
    estimatingGas: {}
    estimatingPrice: {}
  }
}

type PromiseService<T> = (
  context: ManageAaveParametersStateMachineContext,
  event: ManageAaveParametersStateMachineEvents,
) => Promise<T>

enum actions {
  assignReceivedParameters = 'assignReceivedParameters',
  assignTransactionParameters = 'assignTransactionParameters',
  assignEstimatedGas = 'assignEstimatedGas',
  assignEstimatedGasPrice = 'assignEstimatedGasPrice',
  notifyParent = 'notifyParent',
  logError = 'logError',
}

export interface PreTransactionSequenceMachineServices {
  [services.getParameters]: PromiseService<OpenPositionResult | void>
  [services.estimateGas]: PromiseService<number>
  [services.estimateGasPrice]: PromiseService<HasGasEstimation>
}

export type ManageAaveParametersStateMachineType = typeof manageAaveParametersStateMachine

/*
  Machine based on the following pattern: https://xstate.js.org/docs/patterns/sequence.html#async-sequences
 */
export const manageAaveParametersStateMachine = Machine<
  ManageAaveParametersStateMachineContext,
  ManageAaveParametersStateMachineSchema,
  ManageAaveParametersStateMachineEvents
>(
  {
    id: 'manageAaveParameters',
    initial: 'idle',
    context: {} as ManageAaveParametersStateMachineContext,
    schema: {
      services: {} as {
        [services.getParameters]: {
          data: OpenPositionResult
        }
        [services.estimateGas]: {
          data: number
        }
        [services.estimateGasPrice]: {
          data: HasGasEstimation
        }
      },
    },
    states: {
      idle: {
        on: {
          VARIABLES_RECEIVED: {
            target: 'gettingParameters',
            actions: [actions.assignReceivedParameters],
          },
        },
      },
      gettingParameters: {
        invoke: {
          src: services.getParameters,
          id: services.getParameters,
          onDone: {
            target: 'estimatingGas',
            actions: [actions.assignTransactionParameters, actions.notifyParent],
          },
          onError: {
            actions: [actions.logError],
            target: 'idle',
          },
        },
        on: {
          VARIABLES_RECEIVED: {
            target: 'gettingParameters',
            actions: [actions.assignReceivedParameters],
          },
        },
      },
      estimatingGas: {
        invoke: {
          src: services.estimateGas,
          id: services.estimateGas,
          onDone: {
            target: 'estimatingPrice',
            actions: [actions.assignEstimatedGas],
          },
          onError: {
            actions: [actions.logError],
            target: 'idle',
          },
        },
        on: {
          VARIABLES_RECEIVED: {
            target: 'gettingParameters',
            actions: [actions.assignReceivedParameters],
          },
        },
      },
      estimatingPrice: {
        invoke: {
          src: services.estimateGasPrice,
          id: services.estimateGasPrice,
          onDone: {
            target: 'idle',
            actions: [actions.assignEstimatedGasPrice, actions.notifyParent],
          },
          onError: {
            actions: [actions.logError],
            target: 'idle',
          },
        },
        on: {
          VARIABLES_RECEIVED: {
            target: 'gettingParameters',
            actions: [actions.assignReceivedParameters],
          },
        },
      },
    },
  },
  {
    actions: {
      [actions.assignReceivedParameters]: assign(
        (
          context: ManageAaveParametersStateMachineContext,
          event: ManageAaveParametersStateMachineEvents,
        ) => {
          assertEventType(event, 'VARIABLES_RECEIVED')

          return {
            token: event.token,
            amount: event.amount,
            multiply: event.multiply,
            proxyAddress: event.proxyAddress,
          }
        },
      ),
      [actions.assignTransactionParameters]: assign(
        (
          context: ManageAaveParametersStateMachineContext,
          event: ManageAaveParametersStateMachineEvents,
        ) => {
          assertEventType(event, `done.invoke.${services.getParameters}`)
          return {
            transactionParameters: event.data,
          }
        },
      ),
      [actions.assignEstimatedGas]: assign((context, event) => {
        assertEventType(event, `done.invoke.${services.estimateGas}`)
        return {
          estimatedGas: event.data,
        }
      }),
      [actions.assignEstimatedGasPrice]: assign((context, event) => {
        assertEventType(event, `done.invoke.${services.estimateGas}`)
        return {
          estimatedGas: event.data,
        }
      }),
      [actions.assignEstimatedGasPrice]: assign((context, event) => {
        assertEventType(event, `done.invoke.${services.estimateGasPrice}`)
        return {
          gasPriceEstimation: event.data,
        }
      }),
      [actions.notifyParent]: choose<
        ManageAaveParametersStateMachineContext,
        ManageAaveParametersStateMachineEvents
      >([
        {
          cond: (context) => context.hasParent, // If you know better way to check parent please tell me
          actions: [sendUpdate()],
        },
      ]),
      [actions.logError]: log((context, event) => {
        assertErrorEvent(event)
        return {
          error: event.data,
        }
      }),
    },
    services: {
      [services.getParameters]: () => {
        throw Error('getParameters not implemented. Pass it via config')
      },
      [services.estimateGas]: () => {
        throw Error('estimateGas not implemented. Pass it via config')
      },
      [services.estimateGasPrice]: () => {
        throw Error('estimateGasPrice not implemented. Pass it via config')
      },
    },
  },
)

export const machineConfig = {
  services,
  actions,
}
