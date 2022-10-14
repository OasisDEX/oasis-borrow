import { IRiskRatio, IStrategy } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { assign, createMachine } from 'xstate'
import { log } from 'xstate/lib/actions'
import { MachineOptionsFrom } from 'xstate/lib/types'

import { HasGasEstimation } from '../../../../../helpers/form'

type ParametersStateMachineContext = {
  token?: string
  amount?: BigNumber
  riskRatio?: IRiskRatio
  proxyAddress?: string
  transactionParameters?: IStrategy
  estimatedGas?: number
  gasPriceEstimation?: HasGasEstimation
}

export type ParametersStateMachineEvents = {
  type: 'VARIABLES_RECEIVED'
  readonly token: string
  readonly amount: BigNumber
  readonly riskRatio: IRiskRatio
  readonly proxyAddress?: string
}

/*
  Machine based on the following pattern: https://xstate.js.org/docs/patterns/sequence.html#async-sequences
 */

// what it does:
// 1) call the library; then:
// 2) estimate gas; then:
// 3) estimate gas price
// -> returns gas estimation USD and call data
//
// state machine used because it was easier to cancel previous runs when input changes

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
            cond: 'hasAllVariables',
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
    guards: {
      hasAllVariables: (_, event) => {
        return (
          event.proxyAddress !== undefined &&
          event.amount !== undefined &&
          event.amount.gt(0) &&
          event.token !== undefined
        )
      },
    },
    actions: {
      assignReceivedParameters: assign((context, event) => {
        return {
          token: event.token,
          amount: event.amount,
          riskRatio: event.riskRatio,
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
