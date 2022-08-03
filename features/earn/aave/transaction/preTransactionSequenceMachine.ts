import BigNumber from 'bignumber.js'
import { assign, Machine, sendParent } from 'xstate'

import { HasGasEstimation } from '../../../../helpers/form'
import { OpenPositionResult } from '../../../aave'

export type PreTransactionSequenceContext = {
  token?: string
  amount?: BigNumber
  multiply?: number
  proxyAddress?: string
  transactionParameters?: OpenPositionResult
  estimatedGas?: number
  gasMarketPrice?: BigNumber
}

export type PreTransactionSequenceEvent = {
  type: 'VARIABLES_RECEIVED'
  readonly token: string
  readonly amount: BigNumber
  readonly multiply: number
}

export type PreTransactionSequenceStateSchema = {
  states: {
    idle: {}
    gettingParameters: {}
    estimatingGas: {}
    estimatingPrice: {}
  }
}

type PromiseService<T> = (
  context: PreTransactionSequenceContext,
  event: PreTransactionSequenceEvent,
) => Promise<T>

export interface PreTransactionSequenceMachineServices {
  getParameters: PromiseService<OpenPositionResult>
  estimateGas: PromiseService<number>
  estimateGasPrice: PromiseService<HasGasEstimation>
}

export type PreTransactionSequenceMachineType = typeof preTransactionSequenceMachine

export const preTransactionSequenceMachine = Machine<
  PreTransactionSequenceContext,
  PreTransactionSequenceStateSchema,
  PreTransactionSequenceEvent
>(
  {
    id: 'preTransactionSequence',
    initial: 'idle',
    schema: {
      services: {} as {
        getParameters: {
          data: OpenPositionResult
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
            actions: [
              assign((context, event) => {
                return {
                  token: event.token,
                  amount: event.amount,
                  multiply: event.multiply,
                }
              }),
            ],
          },
        },
      },
      gettingParameters: {
        invoke: {
          src: 'getParameters',
          onDone: {
            target: 'estimatingGas',
            actions: [
              assign((context, event) => {
                return {
                  transactionParameters: event.data,
                }
              }),
            ],
          },
        },
      },
      estimatingGas: {
        invoke: {
          src: 'estimateGas',
          onDone: {
            target: 'gettingPrice',
            actions: [
              assign((context, event) => {
                return {
                  estimatedGas: event.data,
                }
              }),
            ],
          },
        },
      },
      estimatingPrice: {
        invoke: {
          src: 'estimateGasPrice',
          onDone: {
            target: 'idle',
            actions: [
              assign((context, event) => {
                return {
                  gasMarketPrice: event.data.gasPrice,
                }
              }),
              sendParent({ type: 'GAS_ESTIMATION_DONE' }),
            ],
          },
        },
      },
    },
  },
  {
    services: {
      getParameters: () => {
        throw Error('getParameters not implemented. Pass it via config')
      },
      estimateGas: () => {
        throw Error('estimateGas not implemented. Pass it via config')
      },
      estimateGasPrice: () => {
        throw Error('estimateGasPrice not implemented. Pass it via config')
      },
    },
  },
)
