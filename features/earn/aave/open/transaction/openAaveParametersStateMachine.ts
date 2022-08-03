import { OpenPositionResult } from '@oasis-borrow/aave'
import { assertEventType } from '@oasis-borrow/xstate'
import BigNumber from 'bignumber.js'
import { AnyStateMachine, assign, Machine, sendUpdate } from 'xstate'
import { choose } from 'xstate/lib/actions'

import { HasGasEstimation } from '../../../../../helpers/form'

type OpenAaveParametersStateMachineContext = {
  readonly parent?: AnyStateMachine

  token?: string
  amount?: BigNumber
  multiply?: number
  proxyAddress?: string
  transactionParameters?: OpenPositionResult
  estimatedGas?: number
  gasPriceEstimation?: HasGasEstimation
}

export type OpenAaveParametersStateMachineEvents =
  | {
      type: 'VARIABLES_RECEIVED'
      readonly token: string
      readonly amount: BigNumber
      readonly multiply: number
    }
  | {
      type: `done.invoke.${services.getParameters}`
      data: OpenPositionResult
    } | {
  type: `done.invoke.${services.estimateGas}`
  data: number
} | {
  type: `done.invoke.${services.estimateGasPrice}`
  data: HasGasEstimation
}

 type OpenAaveParametersStateMachineSchema = {
  states: {
    idle: {}
    gettingParameters: {}
    estimatingGas: {}
    estimatingPrice: {}
  }
}

type PromiseService<T> = (
  context: OpenAaveParametersStateMachineContext,
  event: OpenAaveParametersStateMachineEvents,
) => Promise<T>

enum services {
  getParameters = 'getParameters',
  estimateGas = 'estimateGas',
  estimateGasPrice = 'estimateGasPrice',
}

enum actions {
  assignReceivedParameters = 'assignReceivedParameters',
  assignTransactionParameters = 'assignTransactionParameters',
  assignEstimatedGas = 'assignEstimatedGas',
  assignEstimatedGasPrice = 'assignEstimatedGasPrice',
  notifyParent = 'notifyParent',
}

export interface PreTransactionSequenceMachineServices {
  [services.getParameters]: PromiseService<OpenPositionResult>
  [services.estimateGas]: PromiseService<number>
  [services.estimateGasPrice]: PromiseService<HasGasEstimation>
}

export type OpenAaveParametersStateMachineType = typeof openAaveParametersStateMachine

/*
  Machine based on the following pattern: https://xstate.js.org/docs/patterns/sequence.html#async-sequences
 */
export const openAaveParametersStateMachine = Machine<
  OpenAaveParametersStateMachineContext,
  OpenAaveParametersStateMachineSchema,
  OpenAaveParametersStateMachineEvents
>(
  {
    id: 'openAaveParameters',
    initial: 'idle',
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
            actions: [actions.assignTransactionParameters],
          },
        },
      },
      estimatingGas: {
        invoke: {
          src: services.estimateGas,
          id: services.estimateGas,
          onDone: {
            target: 'estimatingPrice',
            actions: [
              actions.assignEstimatedGas
            ],
          },
        },
      },
      estimatingPrice: {
        invoke: {
          src: services.estimateGasPrice,
          id: services.estimateGasPrice,
          onDone: {
            target: 'idle',
            actions: [
              actions.assignEstimatedGasPrice,
              actions.notifyParent
            ],
          },
        },
      },
    },
  },
  {
    actions: {
      [actions.assignReceivedParameters]: assign(
        (
          context: OpenAaveParametersStateMachineContext,
          event: OpenAaveParametersStateMachineEvents,
        ) => {
          assertEventType(event, 'VARIABLES_RECEIVED')

          return {
            token: event.token,
            amount: event.amount,
            multiply: event.multiply,
          }
        },
      ),
      [actions.assignTransactionParameters]: assign(
        (
          context: OpenAaveParametersStateMachineContext,
          event: OpenAaveParametersStateMachineEvents,
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
      [actions.notifyParent]: choose<OpenAaveParametersStateMachineContext, OpenAaveParametersStateMachineEvents>([
        {
          cond: (context) => context.parent !== undefined, // If you know better way to check parent please tell me
          actions: [ sendUpdate()]
        },
        {
          actions: []
        }
      ])
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
