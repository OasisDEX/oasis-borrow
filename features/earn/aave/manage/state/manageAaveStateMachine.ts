import { IPosition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { ActorRefFrom, assign, createMachine, send, StateFrom } from 'xstate'
import { MachineOptionsFrom } from 'xstate/lib/types'

import { AaveUserAccountData } from '../../../../../blockchain/calls/aave/aaveLendingPool'
import { AaveUserReserveData } from '../../../../../blockchain/calls/aave/aaveProtocolDataProvider'
import { OperationExecutorTxMeta } from '../../../../../blockchain/calls/operationExecutor'
import { HasGasEstimation } from '../../../../../helpers/form'
import { zero } from '../../../../../helpers/zero'
import { AdjustStEthReturn, CloseStEthReturn } from '../../../../aave'
import {
  TransactionStateMachine,
  TransactionStateMachineEvents,
} from '../../../../stateMachines/transaction'
import {
  ClosePositionParametersStateMachine,
  ClosePositionParametersStateMachineEvents,
} from './closePositionParametersStateMachine'

export interface ManageAaveContext {
  strategy: string // TODO: Consider changing name to reserve token
  token: string
  address: string
  proxyAddress?: string
  protocolData?: AaveProtocolData

  refClosePositionParametersStateMachine?: ActorRefFrom<ClosePositionParametersStateMachine>
  refTransactionStateMachine?: ActorRefFrom<TransactionStateMachine<OperationExecutorTxMeta>>

  currentStep?: number
  totalSteps?: number
  tokenBalance?: BigNumber
  tokenPrice?: BigNumber
  transactionParameters?: AdjustStEthReturn
  balanceAfterClose?: BigNumber
  estimatedGasPrice?: HasGasEstimation
  inputDelay: number
}

export interface AaveProtocolData {
  positionData: AaveUserReserveData
  accountData: AaveUserAccountData
  oraclePrice: BigNumber
  position: IPosition
}

export type ManageAaveEvent =
  | { readonly type: 'POSITION_CLOSED' }
  | { type: 'SET_BALANCE'; balance: BigNumber; tokenPrice: BigNumber }
  | { type: 'ADJUST_POSITION' }
  | { type: 'BACK_TO_EDITING' }
  | { type: 'RETRY' }
  | { type: 'CLOSE_POSITION' }
  | { type: 'START_TRANSACTION' }
  | {
      type: 'CLOSING_PARAMETERS_RECEIVED'
      parameters: CloseStEthReturn
      estimatedGasPrice: HasGasEstimation
    }
  | {
      type: 'ADJUSTING_PARAMETERS_RECEIVED'
      parameters: AdjustStEthReturn
      estimatedGasPrice: HasGasEstimation
    }

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
          getAaveProtocolData: {
            data: AaveProtocolData
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
                src: 'getAaveProtocolData',
                id: 'getAaveProtocolData',
                onDone: [
                  {
                    actions: ['assignProtocolData'],
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
              actions: ['setTokenBalanceFromEvent', 'updateBalanceAfterClose'],
            },
            CLOSE_POSITION: {
              target: 'reviewingClosing',
            },
            ADJUST_POSITION: {
              target: 'reviewingAdjusting',
            },
          },
        },
        reviewingAdjusting: {
          on: {
            BACK_TO_EDITING: {
              target: 'editing',
            },
            START_TRANSACTION: {
              cond: 'validTransactionParameters',
              target: 'txInProgress',
            },
          },
        },
        txInProgress: {
          entry: ['spawnTransactionMachine', 'startTransaction'],
          on: {
            POSITION_CLOSED: {
              target: 'txSuccess',
            },
          },
        },
        txFailure: {
          on: {
            RETRY: {
              target: 'editing',
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
              actions: ['assignTransactionParameters', 'updateBalanceAfterClose'],
            },
            START_TRANSACTION: {
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
        updateBalanceAfterClose: assign((context) => ({
          balanceAfterClose: context.tokenBalance?.plus(
            context.transactionParameters?.simulation.swap.minToTokenAmount ?? zero,
          ),
        })),
        assignProxyAddress: assign((context, event) => ({
          proxyAddress: event.data,
        })),
        assignProtocolData: assign((context, event) => ({
          protocolData: event.data,
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
            valueLocked: context.protocolData!.positionData!.currentATokenBalance!,
          }),
          { to: (context) => context.refClosePositionParametersStateMachine! },
        ),
        startTransaction: send(
          (_): TransactionStateMachineEvents<OperationExecutorTxMeta> => ({
            type: 'START',
          }),
          { to: (context) => context.refTransactionStateMachine! },
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
