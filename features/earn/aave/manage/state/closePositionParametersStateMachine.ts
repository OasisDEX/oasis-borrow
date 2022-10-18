import { IPosition, IStrategy } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { assign, createMachine } from 'xstate'
import { log } from 'xstate/lib/actions'
import { MachineOptionsFrom } from 'xstate/lib/types'

import { HasGasEstimation } from '../../../../../helpers/form'

type ClosePositionParametersStateMachineContext = {
  proxyAddress: string
  token: string
  position: IPosition
  transactionParameters?: IStrategy
  estimatedGas?: number
  gasPriceEstimation?: HasGasEstimation
}

export type ClosePositionParametersStateMachineEvents = {
  type: 'VARIABLES_RECEIVED'
  proxyAddress?: string
  token?: string
  valueLocked?: BigNumber
}

/*
  Machine based on the following pattern: https://xstate.js.org/docs/patterns/sequence.html#async-sequences
 */
export const createClosePositionParametersStateMachine = createMachine(
  {
    predictableActionArguments: true,
    tsTypes: {} as import('./closePositionParametersStateMachine.typegen').Typegen0,
    id: 'closeAaveParameters',
    initial: 'idle',
    context: {} as ClosePositionParametersStateMachineContext,
    schema: {
      context: {} as ClosePositionParametersStateMachineContext,
      events: {} as ClosePositionParametersStateMachineEvents,
      services: {} as {
        getParameters: {
          data: IStrategy | undefined
        }
        estimateGas: {
          data: number
        }
        estimateGasPrice: {
          data: HasGasEstimation
        }
      },
    },
    states: {
      idle: {
        on: {
          VARIABLES_RECEIVED: {
            target: 'gettingParameters',
            actions: ['assignReceivedParameters'],
          },
        },
      },
      gettingParameters: {
        invoke: {
          src: 'getParameters',
          id: 'getParameters',
          onDone: {
            target: 'estimatingGas',
            actions: ['assignTransactionParameters', 'notifyParent'],
          },
          onError: {
            actions: ['logError'],
            target: 'idle',
          },
        },
        on: {
          VARIABLES_RECEIVED: {
            target: 'gettingParameters',
            actions: ['assignReceivedParameters'],
          },
        },
      },
      estimatingGas: {
        invoke: {
          src: 'estimateGas',
          id: 'estimateGas',
          onDone: {
            target: 'estimatingPrice',
            actions: ['assignEstimatedGas'],
          },
          onError: {
            actions: ['logError'],
            target: 'idle',
          },
        },
        on: {
          VARIABLES_RECEIVED: {
            target: 'gettingParameters',
            actions: ['assignReceivedParameters'],
          },
        },
      },
      estimatingPrice: {
        invoke: {
          src: 'estimateGasPrice',
          id: 'estimateGasPrice',
          onDone: {
            target: 'idle',
            actions: ['assignEstimatedGasPrice', 'notifyParent'],
          },
          onError: {
            actions: ['logError'],
            target: 'idle',
          },
        },
        on: {
          VARIABLES_RECEIVED: {
            target: 'gettingParameters',
            actions: ['assignReceivedParameters'],
          },
        },
      },
    },
  },
  {
    actions: {
      assignReceivedParameters: assign((context, event) => {
        return {
          proxyAddress: event.proxyAddress,
          token: event.token,
          valueLocked: event.valueLocked,
        }
      }),
      assignTransactionParameters: assign((context, event) => {
        return {
          transactionParameters: event.data,
        }
      }),
      assignEstimatedGas: assign((context, event) => {
        return {
          estimatedGas: event.data,
        }
      }),
      assignEstimatedGasPrice: assign((context, event) => {
        return {
          gasPriceEstimation: event.data,
        }
      }),
      logError: log((context, event) => {
        return {
          error: event.data,
        }
      }),
    },
  },
)

class ClosePositionParametersStateMachineTypes {
  needsConfiguration() {
    return createClosePositionParametersStateMachine
  }
  withConfig() {
    // @ts-ignore
    return createClosePositionParametersStateMachine.withConfig({})
  }
}

export type ClosePositionParametersStateMachineWithoutConfiguration = ReturnType<
  ClosePositionParametersStateMachineTypes['needsConfiguration']
>
export type ClosePositionParametersStateMachine = ReturnType<
  ClosePositionParametersStateMachineTypes['withConfig']
>
export type ClosePositionParametersStateMachineServices = MachineOptionsFrom<
  ClosePositionParametersStateMachineWithoutConfiguration,
  true
>['services']
