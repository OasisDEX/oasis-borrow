import BigNumber from 'bignumber.js'
import { assign, createMachine } from 'xstate'
import { log } from 'xstate/lib/actions'
import { MachineOptionsFrom } from 'xstate/lib/types'

import { HasGasEstimation } from '../../../../../helpers/form'
import { OperationParameters } from '../../../../aave'

type ParametersStateMachineContext = {
  token?: string
  amount?: BigNumber
  multiply?: BigNumber
  proxyAddress?: string
  transactionParameters?: OperationParameters
  estimatedGas?: number
  gasPriceEstimation?: HasGasEstimation
}

export type ParametersStateMachineEvents = {
  type: 'VARIABLES_RECEIVED'
  readonly token: string
  readonly amount: BigNumber
  readonly multiply: BigNumber
  readonly proxyAddress?: string
}

/*
  Machine based on the following pattern: https://xstate.js.org/docs/patterns/sequence.html#async-sequences
 */
export const createParametersStateMachine = createMachine(
  {
    predictableActionArguments: true,
    tsTypes: {} as import('./parametersStateMachine.typegen').Typegen0,
    id: 'openAaveParameters',
    initial: 'idle',
    context: {},
    schema: {
      context: {} as ParametersStateMachineContext,
      events: {} as ParametersStateMachineEvents,
      services: {} as {
        getParameters: {
          data: OperationParameters | undefined
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
          token: event.token,
          amount: event.amount,
          multiply: event.multiply,
          proxyAddress: event.proxyAddress,
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

class ParametersStateMachineTypes {
  needsConfiguration() {
    return createParametersStateMachine
  }
  withConfig() {
    // @ts-ignore
    return createParametersStateMachine.withConfig({})
  }
}

export type ParametersStateMachineWithoutConfiguration = ReturnType<
  ParametersStateMachineTypes['needsConfiguration']
>
export type ParametersStateMachine = ReturnType<ParametersStateMachineTypes['withConfig']>
export type ParametersStateMachineServices = MachineOptionsFrom<
  ParametersStateMachineWithoutConfiguration,
  true
>['services']
