import { IPosition } from '@oasisdex/oasis-actions'
import { AdjustAaveParameters, CloseAaveParameters, ManageAaveParameters } from 'actions/aave'
import { trackingEvents } from 'analytics/analytics'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import {
  callOperationExecutorWithDpmProxy,
  callOperationExecutorWithDsProxy,
  OperationExecutorTxMeta,
} from 'blockchain/calls/operationExecutor'
import {
  BaseAaveContext,
  BaseAaveEvent,
  contextToTransactionParameters,
  getSlippage,
  isAllowanceNeeded,
  ManageTokenInput,
  ProxyType,
} from 'features/aave/common'
import { getTxTokenAndAmount } from 'features/aave/helpers'
import { defaultManageTokenInputValues } from 'features/aave/manage/containers/AaveManageStateMachineContext'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave/strategyConfig'
import { PositionId } from 'features/aave/types'
import { AllowanceStateMachine } from 'features/stateMachines/allowance'
import { TransactionStateMachine } from 'features/stateMachines/transaction'
import {
  TransactionParametersStateMachine,
  TransactionParametersStateMachineEvent,
} from 'features/stateMachines/transactionParameters'
import { allDefined } from 'helpers/allDefined'
import { zero } from 'helpers/zero'
import { ActorRefFrom, assign, createMachine, send, spawn, StateFrom } from 'xstate'
import { pure } from 'xstate/lib/actions'
import { MachineOptionsFrom } from 'xstate/lib/types'

type ActorFromTransactionParametersStateMachine =
  | ActorRefFrom<TransactionParametersStateMachine<CloseAaveParameters>>
  | ActorRefFrom<TransactionParametersStateMachine<AdjustAaveParameters>>
  | ActorRefFrom<TransactionParametersStateMachine<ManageAaveParameters>>

export interface ManageAaveContext extends BaseAaveContext {
  refTransactionMachine?: ActorRefFrom<TransactionStateMachine<OperationExecutorTxMeta>>
  refParametersMachine?: ActorFromTransactionParametersStateMachine
  positionId: PositionId
  proxyAddress?: string
  ownerAddress?: string
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
  | { type: 'MANAGE_COLLATERAL'; manageTokenAction: ManageTokenInput['manageTokenAction'] }
  | { type: 'MANAGE_DEBT'; manageTokenAction: ManageTokenInput['manageTokenAction'] }
  | { type: 'BACK_TO_EDITING' }
  | { type: 'RETRY' }
  | { type: 'NEXT_STEP' }
  | { type: 'START_TRANSACTION' }
  | {
      type: 'POSITION_PROXY_ADDRESS_RECEIVED'
      proxyAddress: string
      ownerAddress: string
      effectiveProxyAddress: string
    }
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
  depositBorrowAaveMachine: TransactionParametersStateMachine<ManageAaveParameters>,
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
            debouncingManage: {
              after: {
                500: 'loadingManage',
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
            loadingManage: {
              entry: ['requestManageParameters'],
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
          },
        },
        frontend: {
          initial: 'initial',
          states: {
            initial: {
              entry: ['setInitialState'],
              on: {
                CLOSE_POSITION: {
                  target: 'reviewingClosing',
                },
                ADJUST_POSITION: {
                  target: 'editing',
                },
                MANAGE_DEBT: {
                  target: 'manageDebt',
                },
                MANAGE_COLLATERAL: {
                  target: 'manageCollateral',
                },
              },
            },
            editing: {
              entry: ['reset', 'killCurrentParametersMachine', 'spawnAdjustParametersMachine'],
              on: {
                CLOSE_POSITION: {
                  cond: 'canChangePosition',
                  target: 'reviewingClosing',
                  actions: [
                    'reset',
                    'killCurrentParametersMachine',
                    'spawnCloseParametersMachine',
                    'requestParameters',
                  ],
                },
                SET_RISK_RATIO: {
                  cond: 'canChangePosition',
                  target: '#manageAaveStateMachine.background.debouncing',
                  actions: ['userInputRiskRatio', 'riskRatioEvent'],
                },
                RESET_RISK_RATIO: {
                  cond: 'canChangePosition',
                  target: '#manageAaveStateMachine.background.idle',
                  actions: 'reset',
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
            manageCollateral: {
              on: {
                NEXT_STEP: [
                  {
                    cond: 'isAllowanceNeeded',
                    target: 'allowanceCollateralSetting',
                  },
                  {
                    cond: 'validTransactionParameters',
                    target: 'txInProgress',
                    actions: ['closePositionTransactionEvent'],
                  },
                ],
                BACK_TO_EDITING: {
                  cond: 'canAdjustPosition',
                  target: 'editing',
                },
                CLOSE_POSITION: {
                  cond: 'canChangePosition',
                  target: 'reviewingClosing',
                  actions: ['reset', 'killCurrentParametersMachine', 'spawnCloseParametersMachine'],
                },
                USE_SLIPPAGE: {
                  target: ['#manageAaveStateMachine.background.debouncingManage'],
                  actions: 'updateContext',
                },
              },
            },
            manageDebt: {
              on: {
                NEXT_STEP: [
                  {
                    cond: 'isAllowanceNeeded',
                    target: 'allowanceDebtSetting',
                  },
                  {
                    cond: 'validTransactionParameters',
                    target: 'txInProgress',
                    actions: ['closePositionTransactionEvent'],
                  },
                ],
                BACK_TO_EDITING: {
                  cond: 'canAdjustPosition',
                  target: 'editing',
                },
                CLOSE_POSITION: {
                  cond: 'canChangePosition',
                  target: 'reviewingClosing',
                  actions: ['reset', 'killCurrentParametersMachine', 'spawnCloseParametersMachine'],
                },
                USE_SLIPPAGE: {
                  target: ['#manageAaveStateMachine.background.debouncingManage'],
                  actions: 'updateContext',
                },
              },
            },
            allowanceSetting: {
              entry: ['spawnAllowanceMachine'],
              exit: ['killAllowanceMachine'],
              on: {
                ALLOWANCE_SUCCESS: {
                  actions: ['updateAllowance'],
                  target: ['reviewingAdjusting', '#manageAaveStateMachine.background.debouncing'],
                },
              },
            },
            allowanceDebtSetting: {
              entry: ['spawnAllowanceMachine'],
              exit: ['killAllowanceMachine'],
              on: {
                ALLOWANCE_SUCCESS: {
                  actions: ['updateAllowance'],
                  target: ['manageDebt', '#manageAaveStateMachine.background.debouncingManage'],
                },
              },
            },
            allowanceCollateralSetting: {
              entry: ['spawnAllowanceMachine'],
              exit: ['killAllowanceMachine'],
              on: {
                ALLOWANCE_SUCCESS: {
                  actions: ['updateAllowance'],
                  target: [
                    'manageCollateral',
                    '#manageAaveStateMachine.background.debouncingManage',
                  ],
                },
              },
            },
            reviewingAdjusting: {
              entry: ['riskRatioConfirmEvent'],
              on: {
                BACK_TO_EDITING: {
                  target: 'editing',
                },
                NEXT_STEP: {
                  cond: 'validTransactionParameters',
                  target: 'txInProgress',
                  actions: ['riskRatioConfirmTransactionEvent'],
                },
              },
            },
            reviewingClosing: {
              entry: [
                'closePositionEvent',
                'reset',
                // 'killCurrentParametersMachine', -> including this breaks machine when selecting close from drop-down
                'spawnCloseParametersMachine',
                'requestParameters',
              ],
              on: {
                NEXT_STEP: {
                  cond: 'validClosingTransactionParameters',
                  target: 'txInProgress',
                  actions: ['closePositionTransactionEvent'],
                },
                BACK_TO_EDITING: {
                  cond: 'canAdjustPosition',
                  target: 'editing',
                  actions: ['reset', 'resetTokenActionValue'],
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
                BACK_TO_EDITING: {
                  cond: 'canAdjustPosition',
                  target: 'editing',
                  actions: ['reset'],
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
          actions: ['updateContext', 'updateLegacyTokenBalance'],
        },
        CONNECTED_PROXY_ADDRESS_RECEIVED: {
          actions: ['updateContext', 'calculateEffectiveProxyAddress'],
        },
        WEB3_CONTEXT_CHANGED: {
          actions: ['updateContext', 'calculateEffectiveProxyAddress'],
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
          actions: ['updateContext', 'calculateEffectiveProxyAddress'],
        },
        UPDATE_PROTOCOL_DATA: {
          actions: ['updateContext'],
        },
        UPDATE_ALLOWANCE: {
          actions: 'updateContext',
        },
        BACK_TO_EDITING: {
          cond: 'canAdjustPosition',
          target: 'frontend.editing',
          actions: ['reset'],
        },
        CLOSE_POSITION: {
          target: ['frontend.reviewingClosing'],
          actions: ['spawnCloseParametersMachine'],
        },
        MANAGE_COLLATERAL: {
          cond: 'canChangePosition',
          target: 'frontend.manageCollateral',
          actions: [
            'killCurrentParametersMachine',
            'spawnDepositBorrowMachine',
            'resetTokenActionValue',
            'updateCollateralTokenAction',
            'setTransactionTokenToCollateral',
          ],
        },
        MANAGE_DEBT: {
          cond: 'canChangePosition',
          target: 'frontend.manageDebt',
          actions: [
            'killCurrentParametersMachine',
            'spawnDepositBorrowMachine',
            'resetTokenActionValue',
            'updateDebtTokenAction',
            'setTransactionTokenToDebt',
          ],
        },
        UPDATE_COLLATERAL_TOKEN_ACTION: {
          cond: 'canChangePosition',
          target: '#manageAaveStateMachine.background.debouncingManage',
          actions: ['resetTokenActionValue', 'updateCollateralTokenAction'],
        },
        UPDATE_CLOSING_ACTION: {
          cond: 'canChangePosition',
          target: '#manageAaveStateMachine.background.debouncingManage',
          actions: ['resetTokenActionValue', 'updateClosingAction'],
        },
        UPDATE_DEBT_TOKEN_ACTION: {
          cond: 'canChangePosition',
          target: '#manageAaveStateMachine.background.debouncingManage',
          actions: ['resetTokenActionValue', 'updateDebtTokenAction'],
        },
        UPDATE_TOKEN_ACTION_VALUE: {
          cond: 'canChangePosition',
          target: '#manageAaveStateMachine.background.debouncingManage',
          actions: ['updateTokenActionValue'],
        },
        USE_SLIPPAGE: {
          target: ['background.debouncing'],
          actions: 'updateContext',
        },
      },
    },
    {
      guards: {
        validTransactionParameters: ({ proxyAddress, transition }) => {
          return allDefined(proxyAddress, transition)
        },
        validClosingTransactionParameters: ({ proxyAddress, transition, manageTokenInput }) => {
          return allDefined(proxyAddress, transition, manageTokenInput?.closingToken)
        },
        canChangePosition: ({ web3Context, ownerAddress, currentPosition }) =>
          allDefined(web3Context, ownerAddress, currentPosition) &&
          web3Context!.account === ownerAddress,
        isAllowanceNeeded,
        canAdjustPosition: ({ strategyConfig }) =>
          strategyConfig.availableActions.includes('adjust'),
      },
      actions: {
        resetTokenActionValue: assign((_) => ({
          manageTokenInput: {
            manageTokenAction: defaultManageTokenInputValues.manageTokenAction,
            manageTokenActionValue: defaultManageTokenInputValues.manageTokenActionValue,
            closingToken: defaultManageTokenInputValues.closingToken,
          },
          strategy: undefined,
        })),
        updateClosingAction: assign(({ manageTokenInput }, { closingToken }) => ({
          manageTokenInput: {
            ...manageTokenInput,
            closingToken,
          },
        })),
        updateCollateralTokenAction: assign(({ manageTokenInput }, { manageTokenAction }) => ({
          manageTokenInput: {
            ...manageTokenInput,
            manageTokenAction: manageTokenAction || ManageCollateralActionsEnum.DEPOSIT_COLLATERAL,
          },
        })),
        updateDebtTokenAction: assign(({ manageTokenInput }, { manageTokenAction }) => ({
          manageTokenInput: {
            ...manageTokenInput,
            manageTokenAction: manageTokenAction || ManageDebtActionsEnum.BORROW_DEBT,
          },
        })),
        updateTokenActionValue: assign(({ manageTokenInput }, { manageTokenActionValue }) => ({
          manageTokenInput: {
            ...manageTokenInput,
            manageTokenActionValue,
          },
        })),
        userInputRiskRatio: assign((context, event) => ({
          userInput: {
            ...context.userInput,
            riskRatio: event.riskRatio,
          },
        })),
        reset: assign((context) => ({
          userInput: {
            ...context.userInput,
            riskRatio: undefined,
          },
          strategy: undefined,
          transition: undefined,
        })),
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
            AdjustAaveParameters | CloseAaveParameters | ManageAaveParameters
          > => ({
            type: 'VARIABLES_RECEIVED',
            parameters: {
              amount: context.userInput.amount || zero,
              riskRatio:
                context.userInput.riskRatio ||
                context.currentPosition?.riskRatio ||
                context.strategyConfig.riskRatios.minimum,
              proxyAddress: context.proxyAddress!,
              token: context.tokens.deposit,
              context: context.web3Context!,
              slippage: getSlippage(context),
              currentPosition: context.currentPosition!,
              manageTokenInput: context.manageTokenInput,
              proxyType: context.positionCreatedBy,
              protocol: context.strategyConfig.protocol,
              shouldCloseToCollateral:
                context.manageTokenInput?.closingToken === context.tokens.collateral,
              positionType: context.strategyConfig.type,
            },
          }),
          { to: (context) => context.refParametersMachine! },
        ),
        requestManageParameters: send(
          (
            context,
          ): TransactionParametersStateMachineEvent<ManageAaveParameters | CloseAaveParameters> => {
            const { token, amount } = getTxTokenAndAmount(context)
            return {
              type: 'VARIABLES_RECEIVED',
              parameters: {
                proxyAddress: context.proxyAddress!,
                context: context.web3Context!,
                slippage: getSlippage(context),
                currentPosition: context.currentPosition!,
                manageTokenInput: context.manageTokenInput,
                proxyType: context.positionCreatedBy,
                token,
                amount,
                protocol: context.strategyConfig.protocol,
                shouldCloseToCollateral:
                  context.manageTokenInput?.closingToken === context.tokens.collateral,
              },
            }
          },
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
        spawnDepositBorrowMachine: assign((_) => ({
          refParametersMachine: spawn(depositBorrowAaveMachine, 'transactionParameters'),
        })),
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
              token: context.transactionToken || context.tokens.deposit,
              spender: context.proxyAddress!,
              allowanceType: 'unlimited',
              minimumAmount:
                context.manageTokenInput?.manageTokenActionValue ||
                context.userInput.amount ||
                zero,
            }),
            'allowanceMachine',
          ),
        })),
        calculateEffectiveProxyAddress: assign((context) => ({
          effectiveProxyAddress: context.proxyAddress,
        })),
        setTransactionTokenToDebt: assign((context) => ({
          transactionToken: context.strategyConfig.tokens.debt,
        })),
        setTransactionTokenToCollateral: assign((context) => ({
          transactionToken: context.strategyConfig.tokens.collateral,
        })),
        updateLegacyTokenBalance: assign((context, event) => {
          if (!event.balance.deposit) {
            return {
              tokenBalance: undefined,
            }
          }
          return {
            tokenBalance: event.balance.deposit.balance,
            tokenPrice: event.balance.deposit.price,
          }
        }),
        updateAllowance: assign((context, event) => {
          const result = Object.entries(context.tokens).find(([_, token]) => event.token === token)
          if (result === undefined) {
            return {}
          }

          const [type] = result

          if (context.allowance === undefined) {
            return {
              allowance: {
                collateral: zero,
                debt: zero,
                deposit: zero,
                [type]: event.amount,
              },
            }
          }
          return {
            allowance: {
              ...context.allowance,
              [type]: event.amount,
            },
          }
        }),
        setInitialState: send(
          (context) => {
            const firstAction = context.strategyConfig.availableActions[0]

            switch (firstAction) {
              case 'adjust':
                return { type: 'ADJUST_POSITION' }
              case 'manage-collateral':
                return { type: 'MANAGE_COLLATERAL' }
              case 'manage-debt':
                return { type: 'MANAGE_DEBT' }
              case 'close':
                return { type: 'CLOSE_POSITION' }
            }
          },
          { delay: 0 },
        ),
      },
    },
  )
}

class ManageAaveStateMachineTypes {
  needsConfiguration() {
    return createManageAaveStateMachine({} as any, {} as any, {} as any, {} as any, {} as any)
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
