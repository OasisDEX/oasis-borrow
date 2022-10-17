import { IPosition, IRiskRatio, IStrategy } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { ActorRefFrom, assign, createMachine, send, StateFrom } from 'xstate'
import { cancel } from 'xstate/lib/actions'
import { MachineOptionsFrom } from 'xstate/lib/types'

import {
  AaveConfigurationData,
  AaveUserAccountData,
} from '../../../../../blockchain/calls/aave/aaveLendingPool'
import { AaveUserReserveData } from '../../../../../blockchain/calls/aave/aaveProtocolDataProvider'
import { OperationExecutorTxMeta } from '../../../../../blockchain/calls/operationExecutor'
import { amountFromWei } from '../../../../../blockchain/utils'
import { allDefined } from '../../../../../helpers/allDefined'
import { HasGasEstimation } from '../../../../../helpers/form'
import { zero } from '../../../../../helpers/zero'
import {
  TransactionStateMachine,
  TransactionStateMachineEvents,
} from '../../../../stateMachines/transaction'
import { BaseAaveContext, IStrategyInfo } from '../../common/BaseAaveContext'
import {
  ClosePositionParametersStateMachine,
  ClosePositionParametersStateMachineEvents,
} from './closePositionParametersStateMachine'

export interface ManageAaveContext extends BaseAaveContext {
  strategy: string // TODO: Consider changing name to reserve token
  address: string

  refClosePositionParametersStateMachine?: ActorRefFrom<ClosePositionParametersStateMachine>
  refTransactionStateMachine?: ActorRefFrom<TransactionStateMachine<OperationExecutorTxMeta>>

  balanceAfterClose?: BigNumber
}

export interface AaveProtocolData {
  positionData: AaveUserReserveData
  accountData: AaveUserAccountData
  oraclePrice: BigNumber
  position: IPosition
  aaveUserConfiguration: AaveConfigurationData
  aaveReservesList: AaveConfigurationData
}

export type ManageAaveEvent =
  | { readonly type: 'POSITION_CLOSED' }
  | { type: 'SET_BALANCE'; balance: BigNumber; tokenPrice: BigNumber }
  | { type: 'ADJUST_POSITION' }
  | { type: 'BACK_TO_EDITING' }
  | { type: 'RETRY' }
  | { type: 'CLOSE_POSITION' }
  | { type: 'START_TRANSACTION' }
  | { type: 'SET_RISK_RATIO'; riskRatio: IRiskRatio }
  | {
      type: 'CLOSING_PARAMETERS_RECEIVED'
      parameters: IStrategy
      estimatedGasPrice: HasGasEstimation
    }
  | {
      type: 'UPDATE_STRATEGY_INFO'
      strategyInfo: IStrategyInfo
    }
  | { type: 'GO_TO_EDITING' }

export const createManageAaveStateMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOhgBdyCoAFAe1lyrvwBF1z0yxLqaAnOgA8AngEEIEfnFgBiCCzAkCANzoBrJRQHDxk6bHhIQABwZNcLRKCGIAbABYAnCQCsDgBxOHAdg8OARncAJicAGhARRGDPEgBmAAYnOI84gLiUgKdgnwBfXIi0LDxCUgoqfFpzZjYOLnLqMXQVMHpGGvlFZXw1TW5yJpa2iytjM3bLfGsQWwQAhITXEicnBICfDOyEuLtgiKiEV22SXdc-VyOEhxiHfMKMHAJiEkgLStkAZQBRABUAfQAQmIADJiAByAGEvtNxiMpsZZkFgh54g5XE4jikMtsfPtEIEfCRPHENg44pd3AE7iAio9Si8IG8oLIwV8ABr-D4-L40GHVSbTWZ2HwuZxxVYrZLrBwOPEIZJLAIedbBIIJUIZOLU2klZ6vCrMiHAgDy3z+NFNAEkfpbjWC+RNRjZEOknAESAFgq47AEAnYEj4fD6AnL-YTkeiAmi4sEch5gtqHrrSNIVLgwAB3ags9mc7m8sb8p0zfF+okeeNpJyBnzojxynxkkheBwJDx2RIkrK3Ao0pNPFNgNOZ7NAiEAaT+P2Nfy+rGtlrBAHEHXDBYgUii7EdvWda44PLjIi7PXYSF6Y2k7B2smdE8UByRU+ms+8fgAlcEfMQQm1281iJ+ACyvxfO+Hx-O+XxQpaABqc6rjU64IMESTLCSyJtqEqR+nK6SBCQ6oBm20rItW950s85BCJa+A6FABhyD8bJ-B8ACqEJQh8HyIQKCKIK4ezHnMZIogsCxOMqboONeFHJiQ1EAGLoLgAA2ACu0iyFBH4AJq8cWiIXMskrKsKbr+q4cRyhiRKSiKuwJB2CpyY+z4jpUEKqeY7xGlay4AcBoHgZB0FfHBCGFo68LOnMFzujuyTbB22ypHhAbun6Ti7NG4peHkvY6m5Q4vtQXk+cyrIcqx+YGTFJZzFkmVkY4CzosSeFxDJzZnE56SCes26ufS7mvlA5WMO8Y6TtOs7zjay51chKrBPEQTKj4qqHsE1nCXYHgJOh6TksEPpJKd+S9vgdAQHA0xFfSDSVMMNTsJw-QGjoogSFIMhLfxKFnMsvgpB2PhtsldhyjtZ6JMkklnDkZEJoV-aPTwn1FrU71PVAgytFj-2xYeDhuEkh5ZMG7hHgcF4nNcGyqr60lksNzy4y9kxvegRMNTtcTAxs7YkhDOxQ8Jfqk3DeXeMqKQFfcD70vq1C84iMarWS1yodGzjbKGorJMKtZBlG6IK32SvPKNqtRWuANZIddgrGsKS+JtAb1sJqwC-t6xWfGwphmzpDUbR9GMWr9jpCQgZkosKzitcu0HJ47pkr68xRl4Cwo4rlGh0IylqZpYBRwg1w2Yd4kLKb27IvGIcKUIHzqZgmB-XbSEAzEq2Nqqpt+OkoRCQcUYxoRCyZ2LudNzbnneZNUDl-hZ4+H6-oyeqSXiwch5iVW2zIo4kkhyvXsHAAtKtRwdrGVz+DKXo9vkQA */
  createMachine(
    {
      tsTypes: {} as import('./manageAaveStateMachine.typegen').Typegen0,
      schema: {
        context: {} as ManageAaveContext,
        events: {} as ManageAaveEvent,
        services: {} as {
          getParameters: {
            data: { adjustParams: IStrategy; estimatedGasPrice: HasGasEstimation } | undefined
          }
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
          invoke: [
            {
              src: 'getBalance',
              id: 'getBalance',
            },
            {
              src: 'getStrategyInfo',
              id: 'getStrategyInfo',
            },
            {
              src: 'getParameters',
              id: 'getParameters',
              onDone: {
                actions: ['assignTransactionParameters'],
              },
            },
          ],
          on: {
            UPDATE_STRATEGY_INFO: {
              actions: ['updateStrategyInfo'],
            },
            SET_BALANCE: {
              actions: ['setTokenBalanceFromEvent', 'updateBalanceAfterClose'],
            },
            CLOSE_POSITION: {
              target: 'reviewingClosing',
            },
            SET_RISK_RATIO: {
              actions: ['userInputRiskRatio', 'cancelDebouncedGoToEditing', 'debounceGoToEditing'],
            },
            GO_TO_EDITING: {
              target: 'editing',
            },
            ADJUST_POSITION: {
              cond: 'newRiskInputted',
              target: 'reviewingAdjusting',
            },
          },
        },
        reviewingAdjusting: {
          invoke: {
            src: 'getParameters',
            id: 'getParameters',
            onDone: {
              actions: ['assignTransactionParameters'],
            },
          },
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
              actions: ['assignClosingTransactionParameters', 'updateBalanceAfterClose'],
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
          return allDefined(proxyAddress, transactionParameters)
        },
        newRiskInputted: (state) => {
          return (
            allDefined(state.userInput.riskRatio, state.protocolData) &&
            !state.userInput.riskRatio!.loanToValue.eq(
              state.protocolData!.position.riskRatio.loanToValue,
            )
          )
        },
      },
      actions: {
        cancelDebouncedGoToEditing: cancel('debounced-filter'),
        debounceGoToEditing: send('GO_TO_EDITING', { delay: 1000, id: 'debounced-filter' }),
        setTokenBalanceFromEvent: assign((context, event) => ({
          tokenBalance: event.balance,
          tokenPrice: event.tokenPrice,
        })),
        updateBalanceAfterClose: assign((context) => ({
          balanceAfterClose: context.tokenBalance?.plus(
            amountFromWei(
              context.transactionParameters?.simulation.swap.minToTokenAmount ?? zero,
              'ETH',
            ),
          ),
        })),
        userInputRiskRatio: assign((context, event) => {
          return {
            userInput: {
              ...context.userInput,
              riskRatio: event.riskRatio,
            },
          }
        }),
        assignProxyAddress: assign((context, event) => ({
          proxyAddress: event.data,
        })),
        assignProtocolData: assign((context, event) => {
          return {
            protocolData: event.data,
          }
        }),
        assignTransactionParameters: assign((context, event) => ({
          transactionParameters: event.data?.adjustParams,
          estimatedGasPrice: event.data?.estimatedGasPrice,
        })),
        assignClosingTransactionParameters: assign((context, event) => ({
          transactionParameters: event.parameters,
          estimatedGasPrice: event.estimatedGasPrice,
        })),
        updateStrategyInfo: assign((context, event) => ({
          strategyInfo: event.strategyInfo,
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
