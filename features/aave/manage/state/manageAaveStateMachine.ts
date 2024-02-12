import type { AaveLikePosition } from '@oasisdex/dma-library'
import type {
  AdjustAaveParameters,
  CloseAaveParameters,
  ManageAaveParameters,
} from 'actions/aave-like'
import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import type { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import {
  callOperationExecutorWithDpmProxy,
  callOperationExecutorWithDsProxy,
} from 'blockchain/calls/operationExecutor'
import type { ContextConnected } from 'blockchain/network.types'
import { ethNullAddress } from 'blockchain/networks'
import {
  loadStrategyFromTokens,
  ManageCollateralActionsEnum,
  ManageDebtActionsEnum,
} from 'features/aave'
import { getTxTokenAndAmount } from 'features/aave/helpers'
import {
  getAllowanceTokenAmount,
  getAllowanceTokenSymbol,
} from 'features/aave/helpers/manage-inputs-helpers'
import { defaultManageTokenInputValues } from 'features/aave/manage/contexts'
import type {
  BaseAaveContext,
  BaseAaveEvent,
  IStrategyConfig,
  ManageTokenInput,
  ProductType,
  RefTransactionMachine,
} from 'features/aave/types'
import {
  contextToTransactionParameters,
  getSlippage,
  isAllowanceNeededManageActions,
  ProxyType,
} from 'features/aave/types'
import type { PositionId } from 'features/aave/types/position-id'
import type { VaultType } from 'features/generalManageVault/vaultType.types'
import type {
  AaveCumulativeData,
  AaveHistoryEvent,
} from 'features/omni-kit/protocols/aave-like/history/types'
import type { AllowanceStateMachine } from 'features/stateMachines/allowance'
import type { TransactionStateMachine } from 'features/stateMachines/transaction'
import type {
  TransactionParametersStateMachine,
  TransactionParametersStateMachineEvent,
} from 'features/stateMachines/transactionParameters'
import { allDefined } from 'helpers/allDefined'
import { productToVaultType } from 'helpers/productToVaultType'
import { zero } from 'helpers/zero'
import type { ActorRefFrom, StateFrom } from 'xstate'
import { assign, createMachine, send, sendTo, spawn } from 'xstate'
import { pure } from 'xstate/lib/actions'
import type { MachineOptionsFrom } from 'xstate/lib/types'

type ActorFromTransactionParametersStateMachine =
  | ActorRefFrom<TransactionParametersStateMachine<CloseAaveParameters>>
  | ActorRefFrom<TransactionParametersStateMachine<AdjustAaveParameters>>
  | ActorRefFrom<TransactionParametersStateMachine<ManageAaveParameters>>

export interface ManageAaveContext extends BaseAaveContext {
  refTransactionMachine?: RefTransactionMachine
  refParametersMachine?: ActorFromTransactionParametersStateMachine
  positionId: PositionId
  proxyAddress?: string
  ownerAddress?: string
  positionCreatedBy: ProxyType
  updateStrategyConfig?: (vaultType: VaultType) => void
  historyEvents: AaveHistoryEvent[]
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
  | { type: 'MANAGE_COLLATERAL'; manageTokenAction: ManageTokenInput['manageAction'] }
  | { type: 'MANAGE_DEBT'; manageTokenAction: ManageTokenInput['manageAction'] }
  | { type: 'BACK_TO_EDITING' }
  | { type: 'RETRY' }
  | { type: 'NEXT_STEP' }
  | { type: 'START_TRANSACTION' }
  | { type: 'SWITCH_TO_BORROW' }
  | { type: 'SWITCH_TO_MULTIPLY' }
  | { type: 'SWITCH_TO_EARN' }
  | { type: 'RETRY_BORROW_SWITCH' }
  | { type: 'RETRY_MULTIPLY_SWITCH' }
  | { type: 'RETRY_EARN_SWITCH' }
  | {
      type: 'SWITCH_CONFIRMED'
      productType: ProductType
    }
  | { type: 'SWITCH_SUCCESS' }
  | {
      type: 'POSITION_PROXY_ADDRESS_RECEIVED'
      proxyAddress: string
      ownerAddress: string
      effectiveProxyAddress: string
    }
  | { type: 'CURRENT_POSITION_CHANGED'; currentPosition: AaveLikePosition }
  | { type: 'STRATEGTY_UPDATED'; strategyConfig: IStrategyConfig }
  | {
      type: 'HISTORY_UPDATED'
      historyEvents: AaveHistoryEvent[]
      cumulatives?: AaveCumulativeData
    }
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
  return createMachine(
    {
      /** @xstate-layout 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-QpSppiA-YRGH2n3Jw+4-DJTrTcuI5Ufls7KOIWoySujDHDHhlQqm5DMkOMqq41knjeHUUEf8ZW6ti0w1-xA0K3ilDQi9HcsJSE3cGPRGROsQYTlbGpQ-dhwtuGbB8b-dp9gunGZWAM5Gl20QMbYmOoiIuAMGPOv6L2C8hc9bKpzdCjpBbh2ucCiUDQCKEVHFkWWvUBYgI8HELOhsQ1-YJFmIsf2sQHDbSbGGAMYcTo9C7E55Le73FpYy1l2puWeD5fYIVuQvnLLkeSiVh1URmxzBlL3GrP1l6IU9K4f2IMYhrFa2pmwnXMvZd6-13gRW3B+YbQiUrk2Kszeq9tO+S9XCrGGJGOMnG7mqZcx1z86Wds9cDXVRq+9ZDtT4MVqME3yvTaq62Bjb6USWBiTw2ISmEuYaS5t7b3XLllrUYBzR4bjujd6iDyDYPKuze2rnH5fY0JA18vF25zKNmo4+113bgaLgLmrrXeuHFRNonE5CST-J6M3ibNYPa5gAwhFbEOZ79P3WM5HJ99HOXA1Ed5cJ0jePnafN52AmjsYpM-SCLYO+QowQcjlEbJHKmGdvYKWjlnzABNBLV2EtcPOqP89o4Lhjzgwz8VmAGLwuCS7KZezblL72RySC8cQZgeXCwDaK2RrXp3QdTZJ1dzWTZkQzOiPd1KqUrAbdt1tz80fxGx-jwVorw2zX49T0T9Pl3Iea2mz2OUgYYiRD1sXiPduy8x7j31hPB25BHZGynqYhOytN4h3NnOx4wwEt5IDRpvRe-tf71Hwfv2v5tXuB1ZPuip9neJ83+fejUKITMYiLsr5xKI7p3QuXJfArl9j1j7zWjNfH-G43i7c+0qMw9gawIM5gwcCQj+lUYeL+fepe2+Fe5wVcNcdcDcR+M8YmuuAu8Qbkfk-QskDW4urYdgG+I6AaSKAA7hgNQEQGAMQJpuWk9NFLFDcKICUGUDaLOlECDDYNNuNKmm2NMFDp4DDkHEiD5OtjLs-oOiXuQRoFQfsmAO-oQHQQwZFMwQ8GUKweweUIQMVheOzDhIXoDDJB2g1rhFSg1mJHgqQa5nIQoTQYriziofQSUuoTFJoezmwRwXoegSjAYd6I2MYU2PevzKsIhFEKDCEMeJIaHrLjIXAbABQToHQGwBoJSBoLIvIhQawDvKPLmOBEUBwBQKahnPXtfJKrWMHA2FrOJNweSp6ISpECJLEDNqmrYe4kkSkbQGkRQAogiroGoAin4LkR-A9A8IUcUaUQAuUaSn0I0jUbGEEYiL7J7PYGhE4AtmhA2B0QUl0cQKkRoDwKgLIugKMbvJ-AUUUSUegmUZPnMVUeQrUcsQ0Y2NJBhPGiJGsCHlbjAQkZvjYLAJkOIB9GkZIOIswBAPoE4owHgBoFIk4k-nmjuiXkCQQCCd1GCeIggLCRoNQGQP8I0LOkiJEOGKmn7PKAkLGB2mbqEFMt8XKJyIiLsYCcCaCRoOCcwJcvIrIjYEMWQFUpkcgPAbmmqp+qiWyZiRydibifia6ESX4bxOJCIXfqVMeA2F2A0YKDZsvP6AqMMI4CQVIcieKYkckQcacP4mUhUtUrUnUmQs0q0tAfESiWad0X4sSYFrWMFuJIqgGCsKsZyO7DFl2GSq4DECyWiUQOaXQOBKgPQAigorIiwFUJwCIJSBPAZGmDcHka8MDqfrPqTgNKiAYiNDJMHLGD8UiWKc5okWODGbQHGQmUmSmYEhwCIIfMfLXGfDmR-PmWngAUWfPLyPeGKHeGMByNmtWVhm1iOlGYQA2U2YmcmY7m2SIN-L-L2Rcf2f-uDkOa3HrPZGKC6gXOCFWc6dIa6QCcmXgPQGAMkUMtgBAAAFYKLlIlK77-b76PBA6KkbQPELHU51GprkpAztzxD6yppaz8Isk3l3kPlQBPmvnvl-pV6J6zoAXVFAUvHbRxDDSuBLCEVjBTkXkmm1nXlgC3n3l+JIVvkMFoWj6153HH6YVPFLH1EMZoR9DWAQixgLb1iwWUXwV+IlBIraCoXD7V4YWVGAXPEcUPqBgSiBhdziTYhNiCVUUIWiXMgSX7aDZMUzH3EyVYVyUgXbQuDij+n8KyhVa8gaXCVDLaXiX+KfktQA4H6-k-4zysWLHAUrE-SgKBiFTNgjAzAsnEBGBFDoDiDyJyJwCwA8DEC0CXKwBclZGZF8ndaCmyLCmyJKKJXJWyKwBsA5boBAnUDyl-kuxChcirZRhCgtjUm4UhBITEGdyoQhhQFMqXmmkAkRVRUxUaBxWwAJVJUpWqJVAyCGgrhvCPBpxeWHj+6LaLC8hLFOAyhCHzbjJYwRgiQ9ATTGk1mzmub9XRWxXJkjUFXjXAQPCED0yJzagUCnyBLTGgYsw1Vkn1WUngj8QMYES8G8g7UgxOQ9zhWRVnVDUXWjWFWpU3V3UOx6TgTYBFA0ivWGYbQkm1XxBfWNW-U-Tgg57EGChzAxAuBg0DXnXxXMBw33W6QPRPWo0GjEkfV1UUm40dpRgrDrGoiuxpIgjk0Q3DWw1cC3W03rhI0o1o3+ZAgs3Y1s1Ul42TAggxAA3LxgjNiAzr6HUzmbYRVLktmrlpnM2kms0NUK0rqjB0nEEPaehUrmBg360rmpntlDYLVYIzLX4vg80yjHTyicVBAoiA3NgoToiW7Tko4l563xnLksCuWtSA6enBDekrC+lhYBnC4zKGGOANjYgeCoTJDvjoAaCeLwDNDh2OIT6-5NjBgQjIhTahWwggxdWikzmsqaoQCV0YH7TJ1UoQjoh4IMZrC2DLJIhRhgjiytZt3bKjoQAIpgCd3CoKjihOQNWUZeDWBox1jJLSjQa9xh2kVHVT29LPIDJ+IL28SLBb0r3yhr31jSoq2tiRiOBD1QiT0uLt19IvKHKfjn0UapQGJqXGL91mJAqhAgpQj66jBv3dIf3apn116T7amhBrDrCL62VC4WJNggHrB50Qr+jQPwparIo6rf0ji-3JQXgQjDRBC8gJBeAeB5ReDrG36L6gHN2Jbca27kOfKEociRi11iSQi+yWDIhNgoR+yOB+zPza0R1wFjoBrcP4pMN8N6zByCMX7dAF7hgNY0Y0PnndVkXHW8YabwPMUzwgjYgTKrZYwzI4QRaLxUpERdprDCQsn27faKNTC9rt4+2oicgzKejbRjC2C8KRA+gyhPZxE9XkUjpv4x6eOeBmLcirCnldhQippowJDt5d7ZSIj80yOcNwH2HUG0GuFDKeO919BCytiWJggb3C5d4A0Va9CQhmJF4FOvZFOZbyElPKGqGmOGW-64K64B4SNRCBhuSIhVO9CxBeB4xvhROGObbFOKFOHfYuGaYJPDPUajMmKpSAo-STK3ZQi2LcyRCRkNlpEZHpUUEJP8ihCQj8gEKAwgihGtyuC4RIhiycguDxC04H062omXMaB9EDH0BDGTBmOXzBw9iTlNgfOOBwYDR4WJPhmwYBgXPdFpHHGnF3NMNAyh0yQQogibXzxQa8G6m+QyociRmSlWRYmeNzAyQ9guAnNRAhD1Pzzlkdw4jLAuCraYsWkDNvVYJRBhg2OtNB5sxuCBlpTNj8gciWLmDrC0sHCLnR0tkJN521jnZcX1UyS+yogBwLae68hmL2XUWPkvl0XCvo1jZ4XHh8GB59QYOICTKIa0ZIaAz+wWtaViW2vS2BDbOQi7M+gTMBVjAUuGzrBmJewC2DVC1XVFWMt56fXKnrBoTkqrBUpKXOBrBlQrDxuU0jWMuog2b8PhnLyIiktutBBchLCeTpOIj8QO0avJmePmDgh7Qa28XysJIZ2KVLAJBTbQX2IdPh59VGCEAKLUA0ElsIPH6dsCR8PtpCh9sMZ1ESgxAChYghEF2JBAA */
      //eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./manageAaveStateMachine.typegen').Typegen0,
      schema: {
        context: {} as ManageAaveContext,
        events: {} as ManageAaveEvent,
      },
      preserveActionOrder: true,
      predictableActionArguments: true,
      invoke: [
        {
          id: 'historyCallback',
          src: 'historyCallback',
        },
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
          src: 'allowance$',
          id: 'allowance$',
        },
        {
          src: 'reserveData$',
          id: 'reserveData$',
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
              on: {
                SET_RISK_RATIO: {
                  target: '#manageAaveStateMachine.background.debouncing',
                  actions: ['reset'],
                },
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
                SET_RISK_RATIO: {
                  target: '#manageAaveStateMachine.background.debouncing',
                  actions: ['reset'],
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
                  actions: ['userInputRiskRatio'],
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
              entry: [
                'reset',
                'killCurrentParametersMachine',
                'spawnDepositBorrowMachine',
                'setActiveCollateralAction',
              ],
              on: {
                NEXT_STEP: [
                  {
                    cond: 'isAllowanceNeeded',
                    target: 'allowanceCollateralSetting',
                  },
                  {
                    cond: 'isEthersTransaction',
                    target: 'txInProgressEthers',
                  },
                  {
                    cond: 'validTransactionParameters',
                    target: 'txInProgress',
                  },
                ],
                BACK_TO_EDITING: {
                  cond: 'canAdjustPosition',
                  target: 'editing',
                  actions: ['reset'],
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
              entry: ['reset', 'killCurrentParametersMachine', 'spawnDepositBorrowMachine'],
              on: {
                NEXT_STEP: [
                  {
                    cond: 'isAllowanceNeeded',
                    target: 'allowanceDebtSetting',
                  },
                  {
                    cond: 'isEthersTransaction',
                    target: 'txInProgressEthers',
                  },
                  {
                    cond: 'validTransactionParameters',
                    target: 'txInProgress',
                  },
                ],
                BACK_TO_EDITING: {
                  cond: 'canAdjustPosition',
                  target: 'editing',
                  actions: ['reset'],
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
            switchToBorrow: {
              on: {
                SWITCH_CONFIRMED: {
                  target: 'savePositionToDb',
                  actions: 'updateStrategyConfigType',
                },
              },
            },
            switchToMultiply: {
              on: {
                SWITCH_CONFIRMED: {
                  target: 'savePositionToDb',
                  actions: 'updateStrategyConfigType',
                },
              },
            },
            switchToEarn: {
              on: {
                SWITCH_CONFIRMED: {
                  target: 'savePositionToDb',
                  actions: 'updateStrategyConfigType',
                },
              },
            },
            savePositionToDb: {
              invoke: {
                src: 'savePositionToDb$',
                onDone: {
                  actions: 'updateStrategyConfig',
                  target: 'switching',
                },
                onError: {
                  target: 'saveSwitchFailure',
                },
              },
            },
            switching: {
              after: {
                1000: 'editing',
              },
            },
            saveSwitchFailure: {
              on: {
                RETRY_BORROW_SWITCH: 'switchToBorrow',
                RETRY_MULTIPLY_SWITCH: 'switchToMultiply',
                RETRY_EARN_SWITCH: 'switchToEarn',
              },
            },
            reviewingAdjusting: {
              on: {
                BACK_TO_EDITING: {
                  target: 'editing',
                  actions: ['reset', 'killCurrentParametersMachine'],
                },
                NEXT_STEP: [
                  {
                    target: 'txInProgressEthers',
                    cond: 'isEthersTransaction',
                  },
                  {
                    cond: 'validTransactionParameters',
                    target: 'txInProgress',
                  },
                ],
              },
            },
            reviewingClosing: {
              entry: ['reset', 'spawnCloseParametersMachine', 'requestParameters'],
              on: {
                NEXT_STEP: [
                  {
                    target: 'txInProgressEthers',
                    cond: 'isEthersTransaction',
                  },
                  {
                    cond: 'validClosingTransactionParameters',
                    target: 'txInProgress',
                  },
                ],
                BACK_TO_EDITING: {
                  cond: 'canAdjustPosition',
                  target: 'editing',
                  actions: ['reset', 'resetTokenActionValue'],
                },
              },
            },
            txInProgressEthers: {
              entry: [],
              invoke: {
                src: 'runEthersTransaction',
                id: 'runEthersTransaction',
                onError: {
                  target: 'txFailure',
                },
              },
              on: {
                CREATED_MACHINE: {
                  actions: ['updateContext'],
                },
                TRANSACTION_COMPLETED: {
                  target: 'txSuccess',
                },
                TRANSACTION_FAILED: {
                  target: 'txFailure',
                  actions: ['updateContext'],
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
                RETRY: [
                  {
                    target: 'txInProgressEthers',
                    cond: 'isEthersTransaction',
                  },
                  {
                    target: 'txInProgress',
                  },
                ],
                BACK_TO_EDITING: {
                  cond: 'canAdjustPosition',
                  target: 'editing',
                  actions: ['reset', 'killCurrentParametersMachine'],
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
        STRATEGTY_UPDATED: {
          actions: ['updateContext'],
        },
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
          actions: ['updateContext', 'calculateEffectiveProxyAddress', 'sendSigner'],
        },
        GAS_PRICE_ESTIMATION_RECEIVED: {
          actions: 'updateContext',
        },
        UPDATE_STRATEGY_INFO: {
          actions: 'updateContext',
        },
        CURRENT_POSITION_CHANGED: {
          actions: ['updateContext', 'logInfo'],
        },
        POSITION_PROXY_ADDRESS_RECEIVED: {
          actions: ['updateContext', 'calculateEffectiveProxyAddress', 'sendHistoryRequest'],
        },
        UPDATE_ALLOWANCE: {
          actions: 'updateContext',
        },
        BACK_TO_EDITING: {
          cond: 'canAdjustPosition',
          target: 'frontend.editing',
          actions: ['reset', 'killCurrentParametersMachine'],
        },
        CLOSE_POSITION: {
          target: ['frontend.reviewingClosing'],
          actions: ['spawnCloseParametersMachine'],
        },
        MANAGE_COLLATERAL: {
          cond: 'canChangePosition',
          target: 'frontend.manageCollateral',
          actions: [
            'resetTokenActionValue',
            'updateCollateralTokenAction',
            'setTransactionTokenToCollateral',
          ],
        },
        MANAGE_DEBT: {
          cond: 'canChangePosition',
          target: 'frontend.manageDebt',
          actions: ['resetTokenActionValue', 'updateDebtTokenAction', 'setTransactionTokenToDebt'],
        },
        UPDATE_COLLATERAL_TOKEN_ACTION: {
          cond: 'canChangePosition',
          actions: ['resetTokenActionValue', 'updateCollateralTokenAction', 'reset'],
        },
        UPDATE_CLOSING_ACTION: {
          cond: 'canChangePosition',
          target: '#manageAaveStateMachine.background.debouncingManage',
          actions: ['resetTokenActionValue', 'updateClosingAction', 'reset'],
        },
        UPDATE_DEBT_TOKEN_ACTION: {
          cond: 'canChangePosition',
          actions: ['resetTokenActionValue', 'updateDebtTokenAction', 'reset'],
        },
        UPDATE_INPUT1_ACTION_VALUE: {
          cond: 'canChangePosition',
          target: '#manageAaveStateMachine.background.debouncingManage',
          actions: ['updateInput1ActionValue', 'reset'],
        },
        UPDATE_INPUT2_ACTION_VALUE: {
          cond: 'canChangePosition',
          target: '#manageAaveStateMachine.background.debouncingManage',
          actions: ['updateInput2ActionValue', 'reset'],
        },
        SET_STOP_LOSS_LEVEL: {
          actions: 'updateContext',
        },
        SET_STOP_LOSS_TX_DATA_LAMBDA: {
          actions: 'updateContext',
        },
        USE_SLIPPAGE: {
          target: ['background.debouncing'],
          actions: 'updateContext',
        },
        SWITCH_TO_BORROW: {
          target: 'frontend.switchToBorrow',
        },
        SWITCH_TO_MULTIPLY: {
          target: 'frontend.switchToMultiply',
        },
        SWITCH_TO_EARN: {
          target: 'frontend.switchToEarn',
        },
        HISTORY_UPDATED: {
          actions: 'updateContext',
        },
        UPDATE_RESERVE_DATA: {
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
        isAllowanceNeeded: isAllowanceNeededManageActions,
        canAdjustPosition: ({ strategyConfig }) =>
          strategyConfig.availableActions().includes('adjust'),
        isEthersTransaction: ({ strategyConfig, proxyAddress, transition }) =>
          allDefined(proxyAddress, transition) &&
          strategyConfig.executeTransactionWith === 'ethers',
      },
      actions: {
        resetTokenActionValue: assign((_) => ({
          manageTokenInput: {
            manageAction: defaultManageTokenInputValues.manageAction,
            manageInput1Value: defaultManageTokenInputValues.manageInput1Value,
            manageInput2Value: defaultManageTokenInputValues.manageInput2Value,
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
        setActiveCollateralAction: assign(({ manageTokenInput }) => {
          return {
            manageTokenInput: {
              ...manageTokenInput,
              manageAction:
                manageTokenInput?.manageAction ?? ManageCollateralActionsEnum.DEPOSIT_COLLATERAL,
            },
          }
        }),
        updateCollateralTokenAction: assign(({ manageTokenInput }, { manageTokenAction }) => ({
          manageTokenInput: {
            ...manageTokenInput,
            manageAction: manageTokenAction || ManageCollateralActionsEnum.DEPOSIT_COLLATERAL,
          },
        })),
        updateDebtTokenAction: assign(({ manageTokenInput }, { manageTokenAction }) => ({
          manageTokenInput: {
            ...manageTokenInput,
            manageAction: manageTokenAction || ManageDebtActionsEnum.BORROW_DEBT,
          },
        })),
        updateInput1ActionValue: assign(({ manageTokenInput }, { manageInput1Value }) => ({
          manageTokenInput: {
            ...manageTokenInput,
            manageInput1Value,
          },
        })),
        updateInput2ActionValue: assign(({ manageTokenInput }, { manageInput2Value }) => ({
          manageTokenInput: {
            ...manageTokenInput,
            manageInput2Value,
          },
        })),
        userInputRiskRatio: assign((context, event) => {
          return {
            userInput: {
              ...context.userInput,
              riskRatio: event.riskRatio,
            },
          }
        }),
        reset: assign((context) => ({
          userInput: {
            ...context.userInput,
            riskRatio: undefined,
          },
          strategy: undefined,
          transition: undefined,
        })),
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
              manageTokenInput: context.manageTokenInput,
              slippage: getSlippage(context),
              currentPosition: context.currentPosition!,
              proxyType: context.positionCreatedBy,
              protocol: context.strategyConfig.protocol,
              shouldCloseToCollateral:
                context.manageTokenInput?.closingToken === context.tokens.collateral,
              positionType: context.strategyConfig.type,
              userAddress: context.web3Context?.account ?? ethNullAddress,
              networkId: context.strategyConfig.networkId,
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
                slippage: getSlippage(context),
                currentPosition: context.currentPosition!,
                manageTokenInput: context.manageTokenInput,
                proxyType: context.positionCreatedBy,
                token,
                amount,
                protocol: context.strategyConfig.protocol,
                positionType: context.strategyConfig.type,
                shouldCloseToCollateral:
                  context.manageTokenInput?.closingToken === context.tokens.collateral,
                userAddress: context.web3Context?.account ?? ethNullAddress,
                networkId: context.strategyConfig.networkId,
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
        updateStrategyConfigType: assign((context, event) => {
          const currentStrategy = context.strategyConfig
          const newStrategy = loadStrategyFromTokens(
            currentStrategy.tokens.collateral,
            currentStrategy.tokens.debt,
            currentStrategy.network,
            currentStrategy.protocol,
            productToVaultType(event.productType),
          )
          return {
            ...context,
            strategyConfig: newStrategy,
          }
        }),
        updateStrategyConfig: pure((context) => {
          const newTemporaryProductType = context.strategyConfig.type
          const updatedVaultType = productToVaultType(newTemporaryProductType)

          if (context.updateStrategyConfig && updatedVaultType) {
            context.updateStrategyConfig(updatedVaultType)
          }
          return undefined
        }),
        spawnDepositBorrowMachine: assign((context) => ({
          refParametersMachine: spawn(
            depositBorrowAaveMachine.withContext({
              ...depositBorrowAaveMachine.context,
              runWithEthers: context.strategyConfig.executeTransactionWith === 'ethers',
              signer: (context.web3Context as ContextConnected)?.transactionProvider,
            }),
            'transactionParameters',
          ),
        })),
        spawnAdjustParametersMachine: assign((context) => ({
          refParametersMachine: spawn(
            adjustParametersStateMachine.withContext({
              ...adjustParametersStateMachine.context,
              runWithEthers: context.strategyConfig.executeTransactionWith === 'ethers',
              signer: (context.web3Context as ContextConnected)?.transactionProvider,
            }),
            'transactionParameters',
          ),
        })),
        spawnCloseParametersMachine: assign((context) => {
          return {
            refParametersMachine: spawn(
              closeParametersStateMachine.withContext(() => {
                return {
                  ...closeParametersStateMachine.context,
                  runWithEthers: context.strategyConfig.executeTransactionWith === 'ethers',
                  signer: (context.web3Context as ContextConnected)?.transactionProvider,
                }
              }),
              'transactionParameters',
            ),
          }
        }),
        killCurrentParametersMachine: pure((context) => {
          if (context.refParametersMachine && context.refParametersMachine.stop) {
            context.refParametersMachine.stop()
          }
          return undefined
        }),
        updateContext: assign((_, event) => {
          return {
            ...event,
          }
        }),
        killAllowanceMachine: pure((context) => {
          if (context.refAllowanceStateMachine && context.refAllowanceStateMachine.stop) {
            context.refAllowanceStateMachine.stop()
          }
          return undefined
        }),
        spawnAllowanceMachine: assign((context) => ({
          refAllowanceStateMachine: spawn(
            allowanceStateMachine.withContext({
              token: getAllowanceTokenSymbol(context) || context.tokens.deposit,
              spender: context.proxyAddress!,
              allowanceType: 'unlimited',
              minimumAmount: getAllowanceTokenAmount(context) || context.userInput.amount || zero,
              runWithEthers: context.strategyConfig.executeTransactionWith === 'ethers',
              signer: (context.web3Context as ContextConnected)?.transactionProvider,
              networkId: context.strategyConfig.networkId,
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
        logInfo: pure((_context) => {
          // You can use this method to log some informaton about the current state
          return ''
        }),
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
            const firstAction = context.strategyConfig.availableActions()[0]

            switch (firstAction) {
              case 'adjust':
                return { type: 'ADJUST_POSITION' }
              case 'manage-collateral':
                return { type: 'MANAGE_COLLATERAL' }
              case 'manage-debt':
                return { type: 'MANAGE_DEBT' }
              case 'close':
                return { type: 'CLOSE_POSITION' }
              case 'switch-to-borrow':
                return { type: 'SWITCH_TO_BORROW' }
              case 'switch-to-multiply':
                return { type: 'SWITCH_TO_MULTIPLY' }
              case 'switch-to-earn':
                return { type: 'SWITCH_TO_EARN' }
            }
          },
          { delay: 0 },
        ),
        sendSigner: sendTo(
          (context) => context.refParametersMachine!,
          (context) => {
            return {
              type: 'SIGNER_CHANGED',
              signer: (context.web3Context as ContextConnected)?.transactionProvider,
            }
          },
        ),
        sendHistoryRequest: sendTo('historyCallback', (context) => {
          return {
            type: 'PROXY_RECEIVED',
            proxyAddress: context.proxyAddress,
          }
        }),
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
