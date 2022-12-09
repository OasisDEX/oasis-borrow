import { IPosition } from '@oasisdex/oasis-actions'
import { trackingEvents } from 'analytics/analytics'
import { ActorRefFrom, assign, createMachine, send, spawn, StateFrom } from 'xstate'
import { pure } from 'xstate/lib/actions'
import { MachineOptionsFrom } from 'xstate/lib/types'

import { TransactionDef } from '../../../../blockchain/calls/callsHelpers'
import {
  callOperationExecutorWithDpmProxy,
  callOperationExecutorWithDsProxy,
  OperationExecutorTxMeta,
} from '../../../../blockchain/calls/operationExecutor'
import { allDefined } from '../../../../helpers/allDefined'
import { zero } from '../../../../helpers/zero'
import { AllowanceStateMachine } from '../../../stateMachines/allowance'
import { TransactionStateMachine } from '../../../stateMachines/transaction'
import {
  TransactionParametersStateMachine,
  TransactionParametersStateMachineEvent,
} from '../../../stateMachines/transactionParameters'
import {
  BaseAaveContext,
  BaseAaveEvent,
  contextToTransactionParameters,
  isAllowanceNeeded,
} from '../../common/BaseAaveContext'
import { ProxyType, StrategyConfig } from '../../common/StrategyConfigTypes'
import { AdjustAaveParameters, CloseAaveParameters } from '../../oasisActionsLibWrapper'
import { PositionId } from '../../types'

type ActorFromTransactionParametersStateMachine =
  | ActorRefFrom<TransactionParametersStateMachine<CloseAaveParameters>>
  | ActorRefFrom<TransactionParametersStateMachine<AdjustAaveParameters>>

export interface ManageAaveContext extends BaseAaveContext {
  refTransactionMachine?: ActorRefFrom<TransactionStateMachine<OperationExecutorTxMeta>>
  refParametersMachine?: ActorFromTransactionParametersStateMachine
  strategyConfig: StrategyConfig
  positionId: PositionId
  proxyAddress?: string
  positionCreatedBy: ProxyType
}

function getTransactionDef(context: ManageAaveContext): TransactionDef<OperationExecutorTxMeta> {
  const { positionCreatedBy } = context

  return positionCreatedBy === ProxyType.DsProxy
    ? callOperationExecutorWithDsProxy
    : callOperationExecutorWithDpmProxy
}

export type ManageAaveEvent =
  | { type: 'ADJUST_POSITION' }
  | { type: 'CLOSE_POSITION' }
  | { type: 'MANAGE_COLLATERAL' }
  | { type: 'MANAGE_DEBT' }
  | { type: 'BACK_TO_EDITING' }
  | { type: 'RETRY' }
  | { type: 'START_TRANSACTION' }
  | { type: 'POSITION_PROXY_ADDRESS_RECEIVED'; proxyAddress: string }
  | { type: 'CURRENT_POSITION_CHANGED'; currentPosition: IPosition }
  | BaseAaveEvent

export function createManageAaveStateMachine(
  closeParametersStateMachine: TransactionParametersStateMachine<CloseAaveParameters>,
  adjustParametersStateMachine: TransactionParametersStateMachine<AdjustAaveParameters>,
  allowanceStateMachine: AllowanceStateMachine,
  transactionStateMachine: (
    transactionParameters: OperationExecutorTxMeta,
    transactionDef: TransactionDef<OperationExecutorTxMeta>,
  ) => TransactionStateMachine<OperationExecutorTxMeta>,
) {
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOhgBdyCoAFAe1lyrvwBF1z0yxLqaAnOgA8AngEEIEfnFgBiCCzAkCANzoBrJRQHDxk6bHhIQABwZNcLRKCGIAbABYAnCQCsDgBxOHAdg8OARncAJicAGhARRGDPEgBmAAYnOI84gLiUgKdgnwBfXIi0LDxCUgoqfFpzZjYOLnLqMXQVMHpGGvlFZXw1TW5yJpa2iytjM3bLfGsQWwQAhITXEicnBICfDOyEuLtgiKiEV22SXdc-VyOEhxiHfMKMHAJiEkgLStkAZQBRABUAfQAQmIADJiAByAGEvtNxiMpsZZkFgh54g5XE4jikMtsfPtEIEfCRPHENg44pd3AE7iAio9Si8IG8oLIwV8ABr-D4-L40GHVSbTWZ2HwuZxxVYrZLrBwOPEIZJLAIedbBIIJUIZOLU2klZ6vCrMiHAgDy3z+NFNAEkfpbjWC+RNRjZEOknAESAFgq47AEAnYEj4fD6AnL-YTkeiAmi4sEch5gtqHrrSNIVLgwAB3ags9mc7m8sb8p0zfF+okeeNpJyBnzojxynxkkheBwJDx2RIkrK3Ao0pNPFNgNOZ7NAiEAaT+P2Nfy+rGtlrBAHEHXDBYgUii7EdvWda44PLjIi7PXYSF6Y2k7B2smdE8UByRU+ms+8fgAlcEfMQQm1281iJ+ACyvxfO+Hx-O+XxQpaABqc6rjU64IMESTLCSyJtqEqR+nK6SBCQ6oBm20rItW950s85BCJa+A6FABhyD8bJ-B8ACqEJQh8HyIQKCKIK4ezHnMZIogsCxOMqboONeFHJiQ1EAGLoLgAA2ACu0iyFBH4AJq8cWiIXMskrKsKbr+q4cRyhiRKSiKuwJB2CpyY+z4jpUEKqeY7xGlay4AcBoHgZB0FfHBCGFo68LOnMFzujuyTbB22ypHhAbun6Ti7NG4peHkvY6m5Q4vtQXk+cyrIcqx+YGTFJZzFkmVkY4CzosSeFxDJzZnE56SCes26ufS7mvlA5WMO8Y6TtOs7zjay51chKrBPEQTKj4qqHsE1nCXYHgJOh6TksEPpJKd+S9vgdAQHA0xFfSDSVMMNTsJw-QGjoogSFIMhLfxKFnMsvgpB2PhtsldhyjtZ6JMkklnDkZEJoV-aPTwn1FrU71PVAgytFj-2xYeDhuEkh5ZMG7hHgcF4nNcGyqr60lksNzy4y9kxvegRMNTtcTAxs7YkhDOxQ8Jfqk3DeXeMqKQFfcD70vq1C84iMarWS1yodGzjbKGorJMKtZBlG6IK32SvPKNqtRWuANZIddgrGsKS+JtAb1sJqwC-t6xWfGwphmzpDUbR9GMWr9jpCQgZkosKzitcu0HJ47pkr68xRl4Cwo4rlGh0IylqZpYBRwg1w2Yd4kLKb27IvGIcKUIHzqZgmB-XbSEAzEq2Nqqpt+OkoRCQcUYxoRCyZ2LudNzbnneZNUDl-hZ4+H6-oyeqSXiwch5iVW2zIo4kkhyvXsHAAtKtRwdrGVz+DKXo9vkQA */
  return createMachine(
    {
      tsTypes: {} as import('./manageAaveStateMachine.typegen').Typegen0,
      schema: {
        context: {} as ManageAaveContext,
        events: {} as ManageAaveEvent,
      },
      preserveActionOrder: true,
      predictableActionArguments: true,
      invoke: [
        {
          src: 'getBalance',
          id: 'getBalance',
        },
        {
          src: 'connectedProxyAddress$',
          id: 'connectedProxyAddress$',
        },
        {
          src: 'positionProxyAddress$',
          id: 'positionProxyAddress$',
        },
        {
          src: 'context$',
          id: 'context$',
        },
        {
          src: 'prices$',
          id: 'prices$',
        },
        {
          src: 'userSettings$',
          id: 'userSettings$',
        },
        {
          src: 'strategyInfo$',
          id: 'strategyInfo$',
        },
        {
          src: 'currentPosition$',
          id: 'currentPosition$',
        },
        {
          src: 'protocolData$',
          id: 'protocolData$',
        },
        {
          src: 'allowance$',
          id: 'allowance$',
        },
      ],
      entry: ['calculateEffectiveProxyAddress'],
      id: 'manageAaveStateMachine',
      type: 'parallel',
      states: {
        background: {
          initial: 'idle',
          states: {
            idle: {},
            debouncing: {
              after: {
                500: 'loading',
              },
            },
            loading: {
              entry: ['requestParameters'],
              on: {
                STRATEGY_RECEIVED: {
                  target: 'idle',
                  actions: ['updateContext'],
                },
              },
            },
          },
          on: {
            CLOSE_POSITION: {
              target: '.loading',
            },
            ADJUST_POSITION: {
              target: '.loading',
            },
          },
        },
        frontend: {
          initial: 'editing',
          states: {
            editing: {
              entry: ['spawnAdjustParametersMachine'],
              on: {
                CLOSE_POSITION: {
                  cond: 'canChangePosition',
                  target: 'reviewingClosing',
                  actions: ['killCurrentParametersMachine', 'spawnCloseParametersMachine'],
                },
                SET_RISK_RATIO: {
                  cond: 'canChangePosition',
                  target: '#manageAaveStateMachine.background.debouncing',
                  actions: ['userInputRiskRatio', 'riskRatioEvent'],
                },
                RESET_RISK_RATIO: {
                  cond: 'canChangePosition',
                  target: '#manageAaveStateMachine.background.debouncing',
                  actions: 'resetRiskRatio',
                },
                ADJUST_POSITION: [
                  {
                    cond: 'isAllowanceNeeded',
                    target: 'allowanceSetting',
                  },
                  {
                    cond: 'validTransactionParameters',
                    target: 'reviewingAdjusting',
                  },
                ],
              },
            },
            allowanceSetting: {
              entry: ['spawnAllowanceMachine'],
              exit: ['killAllowanceMachine'],
              on: {
                ALLOWANCE_SUCCESS: {
                  target: 'reviewingAdjusting',
                },
              },
            },
            reviewingAdjusting: {
              onEntry: ['riskRatioConfirmEvent'],
              on: {
                BACK_TO_EDITING: {
                  target: 'editing',
                },
                START_TRANSACTION: {
                  cond: 'validTransactionParameters',
                  target: 'txInProgress',
                  actions: ['riskRatioConfirmTransactionEvent'],
                },
              },
            },
            reviewingClosing: {
              entry: ['closePositionEvent'],
              on: {
                START_TRANSACTION: {
                  cond: 'validTransactionParameters',
                  target: 'txInProgress',
                  actions: ['closePositionTransactionEvent'],
                },
                BACK_TO_EDITING: {
                  target: 'editing',
                },
              },
            },
            manageCollateral: {
              on: {
                START_TRANSACTION: {
                  cond: 'validTransactionParameters',
                  target: 'txInProgress',
                  actions: ['closePositionTransactionEvent'],
                },
                BACK_TO_EDITING: {
                  target: 'editing',
                },
                CLOSE_POSITION: {
                  cond: 'canChangePosition',
                  target: 'reviewingClosing',
                  actions: ['killCurrentParametersMachine', 'spawnCloseParametersMachine'],
                },
              },
            },
            manageDebt: {
              on: {
                START_TRANSACTION: {
                  cond: 'validTransactionParameters',
                  target: 'txInProgress',
                  actions: ['closePositionTransactionEvent'],
                },
                BACK_TO_EDITING: {
                  target: 'editing',
                },
                CLOSE_POSITION: {
                  cond: 'canChangePosition',
                  target: 'reviewingClosing',
                  actions: ['killCurrentParametersMachine', 'spawnCloseParametersMachine'],
                },
              },
            },
            txInProgress: {
              entry: ['spawnTransactionMachine'],
              on: {
                TRANSACTION_COMPLETED: {
                  target: 'txSuccess',
                },
                TRANSACTION_FAILED: {
                  target: 'txFailure',
                  actions: ['updateContext'],
                },
              },
            },
            txFailure: {
              entry: ['killTransactionMachine'],
              on: {
                RETRY: {
                  target: 'txInProgress',
                },
              },
            },
            txSuccess: {
              entry: ['killTransactionMachine'],
              type: 'final',
            },
          },
        },
      },
      on: {
        PRICES_RECEIVED: {
          actions: 'updateContext',
        },
        USER_SETTINGS_CHANGED: {
          actions: 'updateContext',
        },
        SET_BALANCE: {
          actions: 'updateContext',
        },
        CONNECTED_PROXY_ADDRESS_RECEIVED: {
          actions: 'updateContext',
        },
        WEB3_CONTEXT_CHANGED: {
          actions: 'updateContext',
        },
        GAS_PRICE_ESTIMATION_RECEIVED: {
          actions: 'updateContext',
        },
        UPDATE_STRATEGY_INFO: {
          actions: 'updateContext',
        },
        CURRENT_POSITION_CHANGED: {
          actions: ['updateContext'],
        },
        POSITION_PROXY_ADDRESS_RECEIVED: {
          actions: 'updateContext',
        },
        UPDATE_PROTOCOL_DATA: {
          actions: ['updateContext'],
        },
        UPDATE_ALLOWANCE: {
          actions: 'updateContext',
        },
        MANAGE_COLLATERAL: {
          cond: 'canChangePosition',
          target: 'frontend.manageCollateral',
        },
        MANAGE_DEBT: {
          cond: 'canChangePosition',
          target: 'frontend.manageDebt',
        },
        UPDATE_COLLATERAL_TOKEN_ACTION: {
          cond: 'canChangePosition',
          actions: ['resetTokenActionValue', 'updateCollateralTokenAction'],
        },
        UPDATE_DEBT_TOKEN_ACTION: {
          cond: 'canChangePosition',
          actions: ['resetTokenActionValue', 'updateDebtTokenAction'],
        },
        UPDATE_TOKEN_ACTION_VALUE: {
          cond: 'canChangePosition',
          actions: ['updateTokenActionValue'],
        },
      },
    },
    {
      guards: {
        validTransactionParameters: ({ connectedProxyAddress, strategy }) => {
          return allDefined(connectedProxyAddress, strategy)
        },
        canChangePosition: ({ proxyAddress, connectedProxyAddress, currentPosition }) => {
          return (
            allDefined(proxyAddress, connectedProxyAddress, currentPosition) &&
            proxyAddress === connectedProxyAddress
          )
        },
        isAllowanceNeeded,
      },
      actions: {
        resetTokenActionValue: assign(({ userInput }) => {
          return {
            userInput: {
              ...userInput,
              manageTokenActionValue: undefined,
            },
          }
        }),
        updateCollateralTokenAction: assign(({ userInput }, event) => {
          return {
            userInput: {
              ...userInput,
              manageCollateralAction: event.manageTokenAction,
            },
          }
        }),
        updateDebtTokenAction: assign(({ userInput }, event) => {
          return {
            userInput: {
              ...userInput,
              manageDebtAction: event.manageTokenAction,
            },
          }
        }),
        updateTokenActionValue: assign(({ userInput }, event) => {
          return {
            userInput: {
              ...userInput,
              manageTokenActionValue: event.manageTokenActionValue,
            },
          }
        }),
        userInputRiskRatio: assign((context, event) => {
          return {
            userInput: {
              ...context.userInput,
              riskRatio: event.riskRatio,
            },
          }
        }),
        resetRiskRatio: assign((context) => {
          return {
            userInput: {
              ...context.userInput,
              riskRatio: context.currentPosition?.riskRatio,
            },
          }
        }),
        riskRatioEvent: (context) => {
          trackingEvents.earn.stETHAdjustRiskMoveSlider(context.userInput.riskRatio!.loanToValue)
        },
        riskRatioConfirmEvent: (context) => {
          trackingEvents.earn.stETHAdjustRiskConfirmRisk(context.userInput.riskRatio!.loanToValue)
        },
        riskRatioConfirmTransactionEvent: (context) => {
          trackingEvents.earn.stETHAdjustRiskConfirmTransaction(
            context.userInput.riskRatio!.loanToValue,
          )
        },
        closePositionEvent: trackingEvents.earn.stETHClosePositionConfirm,
        closePositionTransactionEvent: trackingEvents.earn.stETHClosePositionConfirmTransaction,
        requestParameters: send(
          (
            context,
          ): TransactionParametersStateMachineEvent<
            AdjustAaveParameters | CloseAaveParameters
          > => ({
            type: 'VARIABLES_RECEIVED',
            parameters: {
              amount: context.userInput.amount || zero,
              riskRatio: context.userInput.riskRatio || context.currentPosition!.riskRatio,
              proxyAddress: context.connectedProxyAddress!,
              token: context.tokens.deposit,
              context: context.web3Context!,
              slippage: context.userSettings!.slippage,
              currentPosition: context.currentPosition!,
            },
          }),
          { to: (context) => context.refParametersMachine! },
        ),
        spawnTransactionMachine: assign((context) => ({
          refTransactionMachine: spawn(
            transactionStateMachine(
              contextToTransactionParameters(context),
              getTransactionDef(context),
            ),
            'transactionMachine',
          ),
        })),
        killTransactionMachine: pure((context) => {
          if (context.refTransactionMachine && context.refTransactionMachine.stop) {
            context.refTransactionMachine.stop()
          }
          return undefined
        }),
        spawnAdjustParametersMachine: assign((_) => ({
          refParametersMachine: spawn(adjustParametersStateMachine, 'transactionParameters'),
        })),
        spawnCloseParametersMachine: assign((_) => ({
          refParametersMachine: spawn(closeParametersStateMachine, 'transactionParameters'),
        })),
        killCurrentParametersMachine: pure((context) => {
          if (context.refParametersMachine && context.refParametersMachine.stop) {
            context.refParametersMachine.stop()
          }
          return undefined
        }),
        updateContext: assign((_, event) => ({
          ...event,
        })),
        killAllowanceMachine: pure((context) => {
          if (context.refAllowanceStateMachine && context.refAllowanceStateMachine.stop) {
            context.refAllowanceStateMachine.stop()
          }
          return undefined
        }),
        spawnAllowanceMachine: assign((context) => ({
          refAllowanceStateMachine: spawn(
            allowanceStateMachine.withContext({
              token: context.tokens.deposit,
              spender: context.connectedProxyAddress!,
              allowanceType: 'unlimited',
              minimumAmount: context.userInput.amount!,
            }),
            'allowanceMachine',
          ),
        })),
        calculateEffectiveProxyAddress: assign((context) => {
          const effectiveProxyAddress =
            context.positionCreatedBy === ProxyType.DpmProxy
              ? context.userDpmProxy?.proxy
              : context.connectedProxyAddress

          return {
            effectiveProxyAddress,
          }
        }),
      },
    },
  )
}

class ManageAaveStateMachineTypes {
  needsConfiguration() {
    return createManageAaveStateMachine({} as any, {} as any, {} as any, {} as any)
  }

  withConfig() {
    // @ts-ignore
    return createManageAaveStateMachine({} as any, {} as any, {} as any).withConfig({})
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
