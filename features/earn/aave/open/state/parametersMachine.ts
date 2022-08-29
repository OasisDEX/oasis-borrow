import BigNumber from 'bignumber.js'
import { createMachine } from 'xstate'

export const parametersMachine = createMachine({
  id: 'Parameters',
  tsTypes: {} as import('./parametersMachine.typegen').Typegen0,
  schema: {
    context: {} as {
      token: 'ETH'
      amount: BigNumber
      multiply: BigNumber
      proxyAddress: string
    },
    events: {} as {
      type: 'VARIABLES_RECEIVED'
      token: 'ETH'
      amount: BigNumber
      multiply: BigNumber
    },
    services: {} as {
      strategyParameters: {
        data: { gas: BigNumber }
      }
    },
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        VARIABLES_RECEIVED: {
          target: 'gettingParameters',
        },
      },
    },
    gettingParameters: {
      invoke: {
        src: 'strategyParameters',
        id: 'strategy Parameters',
        onDone: [
          {
            target: 'estimatingGas',
          },
        ],
        onError: [
          {
            target: 'error',
          },
        ],
      },
    },
    estimatingGas: {
      invoke: {
        src: 'estimageGas',
        id: 'estimageGas',
        onDone: [
          {
            target: 'estimatingPrice',
          },
        ],
        onError: [
          {
            target: 'error',
          },
        ],
      },
    },
    error: {
      entry: 'logError',
      always: {
        target: 'idle',
      },
    },
    estimatingPrice: {
      invoke: {
        src: 'estimatePrice',
        id: 'estimatePrice',
        onDone: [
          {
            actions: 'sendUpdate',
            target: 'idle',
          },
        ],
        onError: [
          {
            target: 'error',
          },
        ],
      },
    },
  },
})
