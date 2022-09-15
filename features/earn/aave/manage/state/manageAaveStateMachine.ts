import BigNumber from 'bignumber.js'
import { ActorRefFrom, assign, createMachine, send, StateFrom } from 'xstate'
import { MachineOptionsFrom } from 'xstate/lib/types'

import { AaveUserReserveData } from '../../../../../blockchain/calls/aaveProtocolDataProvider'
import { OperationExecutorTxMeta } from '../../../../../blockchain/calls/operationExecutor'
import { HasGasEstimation } from '../../../../../helpers/form'
import { OperationParameters } from '../../../../aave'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import {
  ClosePositionParametersStateMachine,
  ClosePositionParametersStateMachineEvents,
} from './closePositionParametersStateMachine'

export interface ManageAaveContext {
  strategy: string
  token: string
  address: string
  proxyAddress?: string
  positionData?: AaveUserReserveData

  refClosePositionParametersStateMachine?: ActorRefFrom<ClosePositionParametersStateMachine>
  refTransactionStateMachine?: ActorRefFrom<TransactionStateMachine<OperationExecutorTxMeta>>

  currentStep?: number
  totalSteps?: number
  tokenBalance?: BigNumber
  transactionParameters?: OperationParameters
  estimatedGasPrice?: HasGasEstimation
}

export type ManageAaveMachineEvents =
  | {
      readonly type: 'POSITION_CLOSED'
    }
  | {
      readonly type: 'START_ADJUSTING_POSITION'
    }
  | {
      readonly type: 'START_CLOSING_POSITION'
    }
  | { type: 'SET_BALANCE'; balance: BigNumber; tokenPrice: BigNumber }
  | { type: 'NEXT_STEP' }
  | { type: 'BACK_TO_EDITING' }
  | { type: 'RETRY' }
  | { type: 'CLOSE_POSITION' }
  | {
      type: 'CLOSING_PARAMETERS_RECEIVED'
      parameters: OperationParameters
      estimatedGasPrice: HasGasEstimation
    }

export type ManageAaveTransactionEvents =
  | {
      type: 'TRANSACTION_PARAMETERS_RECEIVED'
      parameters: OperationParameters
      estimatedGasPrice: HasGasEstimation
    }
  | {
      readonly type: 'TRANSACTION_PARAMETERS_CHANGED'
      readonly amount: BigNumber
      readonly multiply: number
      readonly token: string
    }

export type ManageAaveEvent = ManageAaveMachineEvents | ManageAaveTransactionEvents

export const createManageAaveStateMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOhgBdyCoAFAe1lyrvwBF1z0yxLqaAnOgA8AngEEIEfnFgBiCCzAkCANzoBrJRQHDxk6bHhIQABwZNcLRKCGIAbABYAnCQCsDgBxOHAdg8OARncAJicAGhARRGDPEgBmAAYnOI84gLiUgKdgnwBfXIi0LDxCUgoqfFpzZjYOLnLqMXQVMHpGGvlFZXw1TW5yJpa2iytjM3bLfGsQWwQAhITXEicnBICfDOyEuLtgiKiEV22SXdc-VyOEhxiHfMKMHAJiEkgLStkAZQBRABUAfQAQmIADJiAByAGEvtNxiMpsZZkFgh54g5XE4jikMtsfPtEIEfCRPHENg44pd3AE7iAio9Si8IG8oLIwV8ABr-D4-L40GHVSbTWZ2HwuZxxVYrZLrBwOPEIZJLAIedbBIIJUIZOLU2klZ6vCrMiHAgDy3z+NFNAEkfpbjWC+RNRjZEOknAESAFgq47AEAnYEj4fD6AnL-YTkeiAmi4sEch5gtqHrrSNIVLgwAB3ags9mc7m8sb8p0zfF+okeeNpJyBnzojxynxkkheBwJDx2RIkrK3Ao0pNPFNgNOZ7NAiEAaT+P2Nfy+rGtlrBAHEHXDBYgUii7EdvWda44PLjIi7PXYSF6Y2k7B2smdE8UByRU+ms+8fgAlcEfMQQm1281iJ+ACyvxfO+Hx-O+XxQpaABqc6rjU64IMESTLCSyJtqEqR+nK6SBCQ6oBm20rItW950s85BCJa+A6FABhyD8bJ-B8ACqEJQh8HyIQKCKIK4ezHnMZIogsCxOMqboONeFHJiQ1EAGLoLgAA2ACu0iyFBH4AJq8cWiIXMskrKsKbr+q4cRyhiRKSiKuwJB2CpyY+z4jpUEKqeY7xGlay4AcBoHgZB0FfHBCGFo68LOnMFzujuyTbB22ypHhAbun6Ti7NG4peHkvY6m5Q4vtQXk+cyrIcqx+YGTFJZzFkmVkY4CzosSeFxDJzZnE56SCes26ufS7mvlA5WMO8Y6TtOs7zjay51chKrBPEQTKj4qqHsE1nCXYHgJOh6TksEPpJKd+S9vgdAQHA0xFfSDSVMMNTsJw-QGjoogSFIMhLfxKFnMsvgpB2PhtsldhyjtZ6JMkklnDkZEJoV-aPTwn1FrU71PVAgytFj-2xYeDhuEkh5ZMG7hHgcF4nNcGyqr60lksNzy4y9kxvegRMNTtcTAxs7YkhDOxQ8Jfqk3DeXeMqKQFfcD70vq1C84iMarWS1yodGzjbKGorJMKtZBlG6IK32SvPKNqtRWuANZIddgrGsKS+JtAb1sJqwC-t6xWfGwphmzpDUbR9GMWr9jpCQgZkosKzitcu0HJ47pkr68xRl4Cwo4rlGh0IylqZpYBRwg1w2Yd4kLKb27IvGIcKUIHzqZgmB-XbSEAzEq2Nqqpt+OkoRCQcUYxoRCyZ2LudNzbnneZNUDl-hZ4+H6-oyeqSXiwch5iVW2zIo4kkhyvXsHAAtKtRwdrGVz+DKXo9vkQA */
  createMachine(
    {
      tsTypes: {} as import('./manageAaveStateMachine.typegen').Typegen0,
      schema: {
        context: {} as ManageAaveContext,
        events: {} as ManageAaveEvent,
        services: {} as {
          getProxyAddress: {
            data: string
          }
          getAavePosition: {
            data: AaveUserReserveData
          }
        },
      },
      preserveActionOrder: true,
      predictableActionArguments: true,
      id: 'manageAave',
      initial: 'gettingPositionData',
      states: {
        gettingPositionData: {
          initial: 'gettingProxyAddress',
          states: {
            gettingProxyAddress: {
              invoke: {
                src: 'getProxyAddress',
                id: 'getProxyAddress',
                onDone: [
                  {
                    actions: 'assignProxyAddress',
                    target: 'gettingAavePosition',
                  },
                ],
              },
            },
            gettingAavePosition: {
              invoke: {
                src: 'getAavePosition',
                id: 'getAavePosition',
                onDone: [
                  {
                    actions: ['assignPositionData'],
                    target: '#manageAave.editing',
                  },
                ],
              },
            },
          },
        },
        editing: {
          invoke: {
            src: 'getBalance',
            id: 'getBalance',
          },
          on: {
            SET_BALANCE: {
              actions: 'setTokenBalanceFromEvent',
            },
            NEXT_STEP: {
              target: 'reviewing',
            },
            CLOSE_POSITION: {
              target: 'reviewingClosing',
            },
          },
        },
        reviewing: {},
        txInProgress: {
          entry: 'spawnTransactionMachine',
          on: {
            POSITION_CLOSED: {
              target: 'txSuccess',
            },
          },
        },
        txFailure: {
          on: {
            RETRY: {
              target: 'reviewing',
            },
          },
        },
        txSuccess: {
          type: 'final',
        },
        reviewingClosing: {
          entry: [
            'spawnClosePositionParametersMachine',
            'sendVariablesToClosePositionParametersMachine',
          ],
          on: {
            CLOSING_PARAMETERS_RECEIVED: {
              actions: 'assignTransactionParameters',
            },
            NEXT_STEP: {
              cond: 'validTransactionParameters',
              target: 'txInProgress',
            },
            BACK_TO_EDITING: {
              target: 'editing',
            },
          },
        },
      },
    },
    {
      guards: {
        validTransactionParameters: ({ proxyAddress, transactionParameters }) => {
          return proxyAddress !== undefined && transactionParameters !== undefined
        },
      },
      actions: {
        setTokenBalanceFromEvent: assign((context, event) => ({
          tokenBalance: event.balance,
          tokenPrice: event.tokenPrice,
        })),
        assignProxyAddress: assign((context, event) => ({
          proxyAddress: event.data,
        })),
        assignPositionData: assign((context, event) => ({
          positionData: event.data,
        })),
        assignTransactionParameters: assign((context, event) => ({
          transactionParameters: event.parameters,
          estimatedGasPrice: event.estimatedGasPrice,
        })),
        sendVariablesToClosePositionParametersMachine: send(
          (context): ClosePositionParametersStateMachineEvents => ({
            type: 'VARIABLES_RECEIVED',
            proxyAddress: context.proxyAddress!,
            token: context.token,
            valueLocked: context.positionData!.currentATokenBalance!,
          }),
          { to: (context) => context.refClosePositionParametersStateMachine! },
        ),
      },
    },
  )

class ManageAaveStateMachineTypes {
  needsConfiguration() {
    return createManageAaveStateMachine
  }
  withConfig() {
    // @ts-ignore
    return createManageAaveStateMachine.withConfig({})
  }
}

export type ManageAaveStateMachineWithoutConfiguration = ReturnType<
  ManageAaveStateMachineTypes['needsConfiguration']
>
export type ManageAaveStateMachine = ReturnType<ManageAaveStateMachineTypes['withConfig']>

export type ManageAaveStateMachineServices = MachineOptionsFrom<
  ManageAaveStateMachineWithoutConfiguration,
  true
>['services']

export type ManageAaveStateMachineState = StateFrom<ManageAaveStateMachine>
