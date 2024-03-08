import { RiskRatio } from '@oasisdex/dma-library'
import type { OpenAaveDepositBorrowParameters, OpenMultiplyAaveParameters } from 'actions/aave-like'
import type { OpenAaveParameters } from 'actions/aave-like/types'
import { trackingEvents } from 'analytics/trackingEvents'
import type BigNumber from 'bignumber.js'
import type { AaveV2ReserveConfigurationData } from 'blockchain/aave'
import { addAutomationBotTriggerV2 } from 'blockchain/calls/automationBot.constants'
import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import type { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import {
  callOperationExecutorWithDpmProxy,
  callOperationExecutorWithDsProxy,
} from 'blockchain/calls/operationExecutor'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import type { ContextConnected } from 'blockchain/network.types'
import { ethNullAddress } from 'blockchain/networks'
import { convertDefaultRiskRatioToActualRiskRatio } from 'features/aave'
import { supportsAaveStopLoss } from 'features/aave/helpers/supportsAaveStopLoss'
import type { BaseAaveContext, BaseAaveEvent, RefTransactionMachine } from 'features/aave/types'
import {
  contextToTransactionParameters,
  getSlippage,
  isAllowanceNeeded,
  ProductType,
  ProxyType,
} from 'features/aave/types'
import { isSupportedAaveAutomationTokenPair } from 'features/automation/common/helpers/isSupportedAaveAutomationTokenPair'
import type {
  AutomationAddTriggerData,
  AutomationAddTriggerTxDef,
} from 'features/automation/common/txDefinitions.types'
import { aaveOffsets } from 'features/automation/metadata/aave/stopLossMetadata'
import {
  extractStopLossDataInput,
  getAaveLikeCommandContractType,
  getAaveLikeStopLossTriggerType,
} from 'features/automation/protection/stopLoss/openFlow/helpers'
import { prepareStopLossTriggerDataV2 } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import type { AllowanceStateMachine } from 'features/stateMachines/allowance'
import type { createDPMAccountStateMachine } from 'features/stateMachines/dpmAccount'
import type {
  DMPAccountStateMachineResultEvents,
  DPMAccountStateMachine,
} from 'features/stateMachines/dpmAccount/'
import type { ProxyResultEvent, ProxyStateMachine } from 'features/stateMachines/proxy'
import type { TransactionStateMachine } from 'features/stateMachines/transaction'
import type {
  TransactionParametersStateMachine,
  TransactionParametersStateMachineEvent,
} from 'features/stateMachines/transactionParameters'
import { allDefined } from 'helpers/allDefined'
import { canOpenPosition } from 'helpers/canOpenPosition'
import { getLocalAppConfig } from 'helpers/config'
import type { AutomationTxData } from 'helpers/context/types'
import { mapAaveLikeProtocol, mapAaveLikeUrlSlug } from 'helpers/getAaveLikeStrategyUrl'
import { zero } from 'helpers/zero'
import type { ActorRefFrom } from 'xstate'
import { assign, createMachine, send, sendTo, spawn } from 'xstate'
import { pure } from 'xstate/lib/actions'
import type { MachineOptionsFrom } from 'xstate/lib/types'

export const totalStepsMap = {
  base: 2,
  proxySteps: (needCreateProxy: boolean) => (needCreateProxy ? 2 : 0),
  allowanceSteps: (needAllowance: boolean) => (needAllowance ? 1 : 0),
}

export interface OpenAaveContext extends BaseAaveContext {
  refProxyMachine?: ActorRefFrom<ProxyStateMachine>
  refDpmAccountMachine?: ActorRefFrom<ReturnType<typeof createDPMAccountStateMachine>>
  refTransactionMachine?: RefTransactionMachine
  refParametersMachine?: ActorRefFrom<TransactionParametersStateMachine<OpenAaveParameters>>
  refStopLossMachine?: ActorRefFrom<TransactionStateMachine<AutomationTxData>>
  hasOpenedPosition?: boolean
  positionRelativeAddress?: string
  blockSettingCalculatedAddresses?: boolean
  reserveConfig?: AaveV2ReserveConfigurationData
}

function getTransactionDef(context: OpenAaveContext): TransactionDef<OperationExecutorTxMeta> {
  const { strategyConfig } = context

  return strategyConfig.proxyType === ProxyType.DpmProxy
    ? callOperationExecutorWithDpmProxy
    : callOperationExecutorWithDsProxy
}

export type OpenAaveEvent =
  | { type: 'BACK_TO_EDITING' }
  | { type: 'RETRY' }
  | { type: 'SET_AMOUNT'; amount?: BigNumber }
  | { type: 'NEXT_STEP' }
  | { type: 'UPDATE_META_INFO'; hasOpenedPosition: boolean }
  | { type: 'RESERVE_CONFIG_UPDATED'; reserveConfig: AaveV2ReserveConfigurationData }
  | BaseAaveEvent
  | ProxyResultEvent
  | DMPAccountStateMachineResultEvents

export function createOpenAaveStateMachine(
  openPostionStateMachine: TransactionParametersStateMachine<OpenAaveParameters>,
  proxyStateMachine: ProxyStateMachine,
  dmpAccountStateMachine: DPMAccountStateMachine,
  allowanceStateMachine: AllowanceStateMachine,
  transactionStateMachine: (
    transactionParameters: OperationExecutorTxMeta,
    transactionDef: TransactionDef<OperationExecutorTxMeta>,
  ) => TransactionStateMachine<OperationExecutorTxMeta>,
  stopLossStateMachine: (
    txData: AutomationAddTriggerData,
    addTriggerDef: AutomationAddTriggerTxDef,
  ) => TransactionStateMachine<AutomationTxData>,
) {
  /** @xstate-layout N4IgpgJg5mDOIC5QHsAOYB2BBAhgNzAGUAXHYsAWRwGMALASwzADoAbZHCRqAYgGEA8gDkhAUT4AVUQBEA+oKFSAGhPkAJLEIDiMgNoAGALqJQqZLHrF6yDCZAAPRAFoAzABZ9zAGxuAjAA4AVgB2N2CATn99F18AGhAAT2d-f19vQJcvQMjfcLcPfwBfQvi0TFwCEjJKGgYmZkhLbmYIMAAjZABXDGpuHntYUnJmHAAzcgAnAApA-X0ASh4y7HwiIZq6RhZGqwwoFvaunu4DYyQQMwsrGztHBBd-L29gwK9fACZ9d+DfOff4pIIJwZYLMQK+F7hQLvFwvLxeIolEDLCprapUTb1HZ9QiiVRYCgCACqilOdkuTRu5zuCOY7mCCNhuQZgUCbgByXebmY73evlec38wWivl8xVK6BWlXWGLq2y4u14YhUskIUgACmTzhTrrZqYhRcF3nSfi4YQ99I8XIEOUC8i5mBCvKa8uF9G9ERLyqsquRZVsGgq+srVGrRJrfGdTOZKXrQHdfNanuFeXyvOEvNa3P9Es4IqC8pngsXWSlWeLkZLUb6NnLA009jwJAAlTSELCSACSwlk6qwrYoeNEzcIsmb4lEnYAanojOSY7rbohhU9-Bb-Hl-N99C9bU4gsahXzfD4XOEYvo3BWUT6ZbUA6gJsh7Ak+BMwGQ+urmwIlABNeRxywKRpC1aMrmsOMHANfQ8mYUIvndI19FFIU918Nx-DBeF8h+S8QUya8q1vdF73qWAwGIRUKE6VgrFQVgWFaDpul6RsBnWEZxjAaZZgWJZiOlUjMRYCiqO4Gi6PoBimMOViTjnbUF0gpcEBhflvBcFwUK3D53g3Pc3GdZg3FmE83BTNwHlmK8kRvIS-TI0TKOo2j6MYngiXVaRgNEVUW18rQAM7IQADEBDAi5lKpeNEE+GJvG+QJUkvN1wmCPdgi3ZgUzNS13RTA8iO9BzawDMTXKkmTPO83zZEHCQsFkELwsinUVP1NTvjSAJYMzTMvi5TLstyz4onTfTwWKqU0UckTmAqiS3OkjzcVUZtO0IABpMdgO7Nroqgu4uWCB1cjPMI2QeKIXGG41RvyiagjFOzBNmsryJcpaqo88c1rHTadtbCR9sU8DY1U94fGNLNj15WEUPZXMgSy+6YU+KGzVMwJpurO95sWvZJPcsAm1bIR2y7Hs+wHIcRzHCdp1nKMoogmLoLUtdQSyIJUmFT4jKRwEnFRnL1PS3JXi5cJcZIua60JqBiZW0mQ388MDrZqDha8HceSNNMIgRXcOcTN4ctmdwdzZDwPll0r-U+8SieW6qACEOx2iQBFkGROxB7RNYhzqze5TNYUeD4D1ePdjcdDcvH0qGM0vF6vRmmtHZYd88HoMAAHdg1EFUw01MHWeD2KEETLTmC5xN7VRnNATNQ8MiiNkISCGIcdekr3qz5gc7zwvGw9vgvZ9v2A60IPF06-xTLBXlTOhyIIhtZGzRyiF3TPRe1yMtPK37zOnKHsBc4LvoAopjsQep-sCTp0dxz4ScZ1A8v2vZhM13Cbw8Jshcl1t8cItouTLzZChVKKETzuHtgPc+xB7CdgwOqJ8UB3ywFgDwCANgWCMDwMgAA1iwYgEwcAYFgDQXUc8OpVw+AlDCAQo5vDdCbQE8IAEMkXtpAI0IZZ9wzvjOsKC0EYOQFguAuCeJPgmMwBiZBRjIAmAAW2YBQqhNDqB0O-odVSGFsw8kvO8Vk6V3SPE3lwnwJo8jFlOomLc7xEFn3mig0KOB6CsE6O+Hg44Wx-nob-RAIQniYUThEHc7xwjnltB8XWddWSnT3rCHCrjREBg8V4nxfjx6T19tIf2IVZ76K1qpU6oJPhugRJbdM0J4koQdPCE8UMrRZSyBk4ScoeDfk7O-V+jNP7BKOogGIxo3i8ndNEzCO50KmW5BZGJkRE7Zg7l0+WWxPK4mbKqPEM9Rx8A0NoZm85ykhxhJ4E8TCMimUlrdZGTgMKwjru6FeBQsimQ2R9Um-0PYABlNDvxGYYtkoIjSZgzBeXSGVHkYShjyN01ooRvHyC44ReNulbO-L+ACWBpDSD+oM9+TMv4sx-qMhAKZPB8mLN8GI6UET+HmbSTCHxQjCicUI9OmLNlMH4MIMQkgZDyGEMoVQRzNA6DJWcyuHNXhpDCM6UUusUxZVhcLDCbITIpliY8Lk+l9C9yRBgZArR4DnHskg+a7BODcFlfPKuTguRYXBOePKnymQaucOmbk0RYRmLZEKV03zB7Yj2MwegEBGIOoYRzcIPUYiZFhBkT4vwHnC0FvBd02ZQh+DdPkXuPK5Y-PrIqA4LFjh7FjSE+4jwTK0rgcGlJQs8z1tCHxTM2RUhTQxSWsNQYI22q4NWpS5yq7giwieeE1SgH9VjhufWKQrJdsXka0N59w1QBrZSz4dIlX10ZayVtdpF1HksVEMxlSN3zUfM+V875PyjvBo602sEAHgjMdEbIrIvjeqBDEzwkKMIbj5OlLKtli0O3PorZWMlI3RrADuyGUK67njMbyDhKq9zaSeDCVkUtk74a8DehWX0XY-VkpWti26x1yuOj3OxvxKkxDeBm5wrJwlhGtE6TCKbSPlXI0rV2jE2AcBHbRl9cbjpQyeFpeGVlXjOiGo8xjbLLQpBPEKcsfboMEyE3BmNdHX0JkiM0pKKULKwX-U4dKDpRrPJ8FkdKAn6jD2vkO8T9rjPSYNFZsEwDVXnthPErCcwXjFjXTECJJHdPWrrO50e+wo1Gak7W5kQGkoC1SLyZlyMIQOiyjXLGZjszfFc9nS+I9vNpcpUY405ioawWCzZ1COVLK9QhMlFFFXNGoPQZg7BFrauGOsvBXkrJerqosrafIngLr+uiV2ncvXsneN8Uhnz6WLKBHglZHLGF0wMi8Lac8u2PDdrmBhDt6KoPxayfYQgnRqDUBkchzq55PBGtMpEPwaTYK2m4TyBEfgQhQiNTEir72nXXW8H4IIHLIginQlDNI56IgpFSuV4ohQgA */
  return createMachine(
    {
      //eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./openAaveStateMachine.typegen').Typegen0,
      schema: { context: {} as OpenAaveContext, events: {} as OpenAaveEvent },
      preserveActionOrder: true,
      predictableActionArguments: true,
      entry: ['spawnParametersMachine'],
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
          src: 'dpmProxy$',
          id: 'dpmProxy$',
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
          src: 'getHasOpenedPosition$',
          id: 'getHasOpenedPosition$',
        },
        {
          src: 'allowance$',
          id: 'allowance$',
        },
        {
          src: 'aaveReserveConfiguration$',
          id: 'aaveReserveConfiguration$',
        },
        {
          src: 'reserveData$',
          id: 'reserveData$',
        },
        {
          src: 'currentPosition$',
          id: 'currentPosition$',
        },
      ],
      id: 'openAaveStateMachine',
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
                ERROR_GETTING_STRATEGY: {
                  target: 'idle',
                },
              },
            },
          },
          on: {
            NEXT_STEP: {
              cond: 'canOpenPosition',
              target: '.loading',
            },
          },
        },
        frontend: {
          initial: 'editing',
          states: {
            editing: {
              entry: ['resetCurrentStep', 'setTotalSteps', 'calculateEffectiveProxyAddress'],
              on: {
                SET_AMOUNT: [
                  {
                    target: '#openAaveStateMachine.background.debouncing',
                    // only call library greater-than-zero amount
                    cond: 'userInputtedAmountGreaterThanZero',
                    actions: ['setAmount', 'calculateAuxiliaryAmount'],
                  },
                  // fall through to this next one if the amount is zero
                  // (e.g. user is halfway through typing  "0.002")
                  {
                    actions: ['setAmount', 'calculateAuxiliaryAmount'],
                  },
                ],
                SET_DEBT: {
                  target: '#openAaveStateMachine.background.debouncing',
                  actions: ['setDebt'],
                },
                SET_RISK_RATIO: {
                  target: '#openAaveStateMachine.background.debouncing',
                  actions: 'setRiskRatio',
                },
                RESET_RISK_RATIO: {
                  target: '#openAaveStateMachine.background.debouncing',
                  actions: 'resetRiskRatio',
                },
                NEXT_STEP: [
                  {
                    target: 'dpmProxyCreating',
                    cond: 'shouldCreateDpmProxy',
                    actions: 'incrementCurrentStep',
                  },
                  {
                    target: 'dsProxyCreating',
                    cond: 'shouldCreateDsProxy',
                    actions: 'incrementCurrentStep',
                  },
                  {
                    target: 'allowanceSetting',
                    cond: 'isAllowanceNeeded',
                    actions: 'incrementCurrentStep',
                  },
                  {
                    target: 'optionalStopLoss',
                    cond: 'canSetupStopLoss',
                    actions: 'incrementCurrentStep',
                  },
                  {
                    target: 'reviewing',
                    cond: 'canOpenPosition',
                    actions: 'incrementCurrentStep',
                  },
                ],
              },
            },
            dsProxyCreating: {
              entry: ['spawnProxyMachine'],
              exit: ['killProxyMachine'],
              on: {
                PROXY_CREATED: {
                  target: 'editing',
                  actions: 'updateContext',
                },
              },
            },
            dpmProxyCreating: {
              entry: ['spawnDpmProxyMachine'],
              exit: ['killDpmProxyMachine'],
              on: {
                DPM_ACCOUNT_CREATED: {
                  actions: ['updateContext', 'calculateEffectiveProxyAddress', 'setTotalSteps'],
                  target: 'editing',
                },
              },
            },
            allowanceSetting: {
              entry: ['spawnAllowanceMachine'],
              exit: ['killAllowanceMachine'],
              on: {
                ALLOWANCE_SUCCESS: {
                  actions: ['updateAllowance'],
                  target: 'editing',
                },
              },
            },
            optionalStopLoss: {
              entry: 'updateStopLossInitialState',
              on: {
                NEXT_STEP: {
                  target: 'reviewing',
                  actions: 'incrementCurrentStep',
                },
                SET_STOP_LOSS_SKIPPED: {
                  target: 'reviewing',
                  actions: ['updateContext', 'incrementCurrentStep'],
                },
                BACK_TO_EDITING: {
                  target: 'editing',
                  actions: 'decrementCurrentStep',
                },
              },
            },
            reviewing: {
              entry: 'eventConfirmRiskRatio',
              on: {
                NEXT_STEP: [
                  {
                    target: 'txInProgressEthers',
                    cond: 'isEthersTransaction',
                  },
                  {
                    target: 'txInProgress',
                    cond: 'validTransactionParameters',
                  },
                ],
                BACK_TO_EDITING: {
                  target: 'editing',
                  actions: 'decrementCurrentStep',
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
                TRANSACTION_COMPLETED: [
                  {
                    cond: 'isStopLossSet',
                    target: 'txStopLoss',
                  },
                  {
                    target: 'txSuccess',
                  },
                ],
                TRANSACTION_FAILED: {
                  target: 'txFailure',
                  actions: ['updateContext'],
                },
              },
            },
            txInProgress: {
              entry: [
                'eventConfirmTransaction',
                'spawnTransactionMachine',
                'disableChangingAddresses',
              ],
              on: {
                TRANSACTION_COMPLETED: [
                  {
                    cond: 'isStopLossSet',
                    target: 'txStopLoss',
                  },
                  {
                    target: 'txSuccess',
                  },
                ],
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
                  target: 'editing',
                },
              },
            },
            stopLossTxFailure: {
              entry: ['killTransactionMachine'],
              on: {
                RETRY: [
                  {
                    target: 'txInProgressEthers',
                    cond: 'isEthersTransaction',
                  },
                  {
                    target: 'txInProgress',
                    cond: 'validTransactionParameters',
                  },
                ],
                BACK_TO_EDITING: {
                  target: 'editing',
                },
              },
            },
            txStopLoss: {
              on: {
                NEXT_STEP: [
                  {
                    cond: 'isStopLossLambda',
                    target: 'txStopLossLambdaInProgress',
                  },
                  {
                    cond: 'isStopLossStandard',
                    target: 'txStopLossInProgress',
                  },
                ],
              },
            },
            txStopLossInProgress: {
              entry: ['spawnStopLossStateMachine'],
              on: {
                TRANSACTION_COMPLETED: {
                  target: 'txSuccess',
                },
                TRANSACTION_FAILED: {
                  target: 'stopLossTxFailure',
                  actions: ['updateContext'],
                },
              },
            },
            txStopLossLambdaInProgress: {
              on: {
                TRANSACTION_COMPLETED: {
                  target: 'txSuccess',
                },
                TRANSACTION_FAILED: {
                  target: 'stopLossTxFailure',
                  actions: ['updateContext'],
                },
              },
            },
            txSuccess: {
              entry: ['killTransactionMachine', 'killStopLossStateMachine'],
              after: {
                0: 'savePositionToDb',
              },
            },
            savePositionToDb: {
              invoke: {
                src: 'savePositionToDb$',
                id: 'savePositionToDb$',
                onDone: 'finalized',
                onError: 'finalized',
              },
            },
            finalized: {
              type: 'final',
            },
          },
        },
      },
      on: {
        PRICES_RECEIVED: {
          actions: ['updateContext', 'setFallbackTokenPrice'],
        },
        USER_SETTINGS_CHANGED: {
          actions: 'updateContext',
        },
        SET_BALANCE: {
          actions: ['updateContext', 'updateLegacyTokenBalance'],
        },
        CONNECTED_PROXY_ADDRESS_RECEIVED: {
          actions: ['updateContext', 'calculateEffectiveProxyAddress', 'setTotalSteps'],
        },
        WEB3_CONTEXT_CHANGED: {
          actions: [
            'resetWalletValues',
            'updateContext',
            'calculateEffectiveProxyAddress',
            'sendSigner',
          ],
        },
        GAS_PRICE_ESTIMATION_RECEIVED: {
          actions: 'updateContext',
        },
        USE_SLIPPAGE: {
          target: ['background.debouncing'],
          actions: 'updateContext',
        },
        UPDATE_STRATEGY_INFO: {
          actions: 'updateContext',
        },
        UPDATE_META_INFO: {
          actions: 'updateContext',
        },
        UPDATE_ALLOWANCE: {
          actions: 'updateContext',
        },
        DPM_PROXY_RECEIVED: {
          actions: ['updateContext', 'calculateEffectiveProxyAddress', 'setTotalSteps'],
        },
        RESERVE_CONFIG_UPDATED: {
          actions: ['updateContext', 'setDefaultRiskRatio'],
        },
        SET_STOP_LOSS_LEVEL: {
          actions: 'updateContext',
        },
        SET_COLLATERAL_ACTIVE: {
          actions: 'updateContext',
        },
        SET_STOP_LOSS_TX_DATA: {
          actions: 'updateContext',
        },
        SET_STOP_LOSS_TX_DATA_LAMBDA: {
          actions: 'updateContext',
        },
        SET_TRAILING_STOP_LOSS_TX_DATA_LAMBDA: {
          actions: 'updateContext',
        },
        SET_PARTIAL_TAKE_PROFIT_TX_DATA_LAMBDA: {
          actions: 'updateContext',
        },
        SET_PARTIAL_TAKE_PROFIT_PROFITS_LAMBDA: {
          actions: 'updateContext',
        },
        SET_PARTIAL_TAKE_PROFIT_FIRST_PROFIT_LAMBDA: {
          actions: 'updateContext',
        },
        SET_STOP_LOSS_SKIPPED: {
          actions: 'updateContext',
        },
        UPDATE_RESERVE_DATA: {
          actions: 'updateContext',
        },
        CURRENT_POSITION_CHANGED: {
          actions: ['updateContext'],
        },
      },
    },
    {
      guards: {
        userInputtedAmountGreaterThanZero: (context, event) => {
          return !!(event.amount && event.amount.gt(0))
        },
        shouldCreateDpmProxy: (context) =>
          context.strategyConfig.proxyType === ProxyType.DpmProxy && !context.userDpmAccount,
        shouldCreateDsProxy: (context) =>
          context.strategyConfig.proxyType === ProxyType.DsProxy && !context.connectedProxyAddress,
        validTransactionParameters: ({ userInput, effectiveProxyAddress, transition }) =>
          allDefined(userInput, effectiveProxyAddress, transition),
        canOpenPosition,
        canSetupStopLoss: ({
          strategyConfig,
          tokenBalance,
          userInput,
          effectiveProxyAddress,
          hasOpenedPosition,
          transition,
        }) =>
          getLocalAppConfig('features').AaveV3ProtectionWrite &&
          supportsAaveStopLoss(strategyConfig.protocol, strategyConfig.networkId) &&
          strategyConfig.type === ProductType.Multiply &&
          isSupportedAaveAutomationTokenPair(
            strategyConfig.tokens.collateral,
            strategyConfig.tokens.debt,
          ) &&
          canOpenPosition({
            userInput,
            hasOpenedPosition,
            tokenBalance,
            effectiveProxyAddress,
            transition,
          }),
        isAllowanceNeeded,
        isStopLossSet: ({ stopLossSkipped, stopLossLevel }) => !stopLossSkipped && !!stopLossLevel,
        isStopLossStandard: ({ stopLossTxData }) => !!stopLossTxData,
        isStopLossLambda: ({ stopLossTxDataLambda }) => !!stopLossTxDataLambda,
        isEthersTransaction: ({ strategyConfig }) =>
          strategyConfig.executeTransactionWith === 'ethers',
      },
      actions: {
        setRiskRatio: assign((context, event) => {
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
              riskRatio: context.defaultRiskRatio,
            },
          }
        }),
        setDefaultRiskRatio: assign((context) => {
          return {
            defaultRiskRatio: convertDefaultRiskRatioToActualRiskRatio(
              context.strategyConfig.riskRatios.default,
              context.reserveConfig?.ltv,
            ),
          }
        }),
        setTotalSteps: assign((context) => {
          const allowance = isAllowanceNeeded(context)
          const proxy = !allDefined(context.effectiveProxyAddress)
          const optionalStopLoss =
            getLocalAppConfig('features').AaveV3ProtectionWrite &&
            supportsAaveStopLoss(
              context.strategyConfig.protocol,
              context.strategyConfig.networkId,
            ) &&
            isSupportedAaveAutomationTokenPair(
              context.strategyConfig.tokens.collateral,
              context.strategyConfig.tokens.debt,
            ) &&
            context.strategyConfig.type === 'Multiply'
              ? 1
              : 0

          const totalSteps =
            totalStepsMap.base +
            totalStepsMap.proxySteps(proxy) +
            totalStepsMap.allowanceSteps(allowance) +
            optionalStopLoss
          return {
            totalSteps: totalSteps,
          }
        }),
        setAmount: assign((context, event) => ({
          userInput: {
            ...context.userInput,
            amount: event.amount,
          },
          strategy: event.amount && event.amount.gt(zero) ? context.transition : undefined,
        })),
        setDebt: assign((context, event) => ({
          userInput: {
            ...context.userInput,
            debtAmount: event.debt,
          },
          transition: event.debt ? context.transition : undefined,
        })),
        calculateAuxiliaryAmount: assign((context) => {
          return {
            auxiliaryAmount: context.userInput.amount?.times(context.tokenPrice || zero),
          }
        }),
        resetCurrentStep: assign((_) => ({
          currentStep: 1,
        })),
        incrementCurrentStep: assign((context) => ({
          currentStep: context.currentStep + 1,
        })),
        decrementCurrentStep: assign((context) => ({
          currentStep: context.currentStep - 1,
          stopLossSkipped: false,
        })),
        eventConfirmRiskRatio: ({ userInput }) => {
          userInput.amount &&
            userInput.riskRatio?.loanToValue &&
            trackingEvents.earn.stETHOpenPositionConfirmRisk(
              userInput.amount,
              userInput.riskRatio.loanToValue,
            )
        },
        eventConfirmTransaction: ({ userInput }) => {
          userInput.amount &&
            userInput.riskRatio?.loanToValue &&
            trackingEvents.earn.stETHOpenPositionConfirmTransaction(
              userInput.amount,
              userInput.riskRatio.loanToValue,
            )
        },
        updateContext: assign((_, event) => ({
          ...event,
        })),
        spawnProxyMachine: assign((_) => ({
          refProxyMachine: spawn(proxyStateMachine, 'dsProxyStateMachine'),
        })),
        killProxyMachine: pure((context) => {
          if (context.refProxyMachine && context.refProxyMachine.stop) {
            context.refProxyMachine.stop()
          }
          return undefined
        }),
        spawnDpmProxyMachine: assign((context) => ({
          refDpmAccountMachine: spawn(
            dmpAccountStateMachine.withContext({
              ...dmpAccountStateMachine.context,
              runWithEthers: context.strategyConfig.executeTransactionWith === 'ethers',
              networkId: context.strategyConfig.networkId,
              signer: (context.web3Context as ContextConnected).transactionProvider,
            }),
            'dmpAccountStateMachine',
          ),
        })),
        killDpmProxyMachine: pure((context) => {
          if (context.refDpmAccountMachine && context.refDpmAccountMachine.stop) {
            context.refDpmAccountMachine.stop()
          }
          return undefined
        }),
        spawnParametersMachine: assign((context) => {
          return {
            refParametersMachine: spawn(
              openPostionStateMachine.withContext({
                ...openPostionStateMachine.context,
                runWithEthers: context.strategyConfig.executeTransactionWith === 'ethers',
                signer: (context.web3Context as ContextConnected)?.transactionProvider,
              }),
              'transactionParameters',
            ),
          }
        }),
        spawnTransactionMachine: assign((context) => ({
          refTransactionMachine: spawn(
            transactionStateMachine(
              contextToTransactionParameters(context),
              getTransactionDef(context),
            ),
            'transactionMachine',
          ),
        })),
        spawnStopLossStateMachine: assign((context) => ({
          refStopLossMachine: spawn(
            stopLossStateMachine(context.stopLossTxData!, addAutomationBotTriggerV2),
            'stopLoss',
          ),
        })),
        killTransactionMachine: pure((context) => {
          if (context.refTransactionMachine && context.refTransactionMachine.stop) {
            context.refTransactionMachine.stop()
          }
          return undefined
        }),
        killStopLossStateMachine: pure((context) => {
          if (context.refStopLossMachine && context.refStopLossMachine.stop) {
            context.refStopLossMachine.stop()
          }
          return undefined
        }),
        requestParameters: send(
          (
            context,
          ): TransactionParametersStateMachineEvent<
            OpenMultiplyAaveParameters | OpenAaveDepositBorrowParameters
          > => {
            const baseParams = {
              // ethNullAddress just for the simulation, there is a guard for that
              proxyAddress: context.effectiveProxyAddress! || ethNullAddress,
              collateralToken: context.strategyConfig.tokens.collateral,
              debtToken: context.tokens.debt,
              depositToken: context.tokens.deposit,
              context: context.web3Context!,
              slippage: getSlippage(context),
              proxyType: context.strategyConfig.proxyType,
              positionType: context.strategyConfig.type,
              protocol: context.strategyConfig.protocol,
              userAddress: context.web3Context?.account ?? ethNullAddress,
              networkId: context.strategyConfig.networkId,
              token: context.tokens.deposit,
            }
            if (context.strategyConfig.type === 'Borrow') {
              return {
                type: 'VARIABLES_RECEIVED',
                parameters: {
                  ...baseParams,
                  amount: context.userInput.amount!,
                  collateralAmount: context.userInput.amount!,
                  borrowAmount: context.userInput.debtAmount || zero,
                } as OpenAaveDepositBorrowParameters,
              }
            } else {
              return {
                type: 'VARIABLES_RECEIVED',
                parameters: {
                  ...baseParams,
                  amount: context.userInput.amount!,
                  riskRatio:
                    context.userInput.riskRatio ||
                    context.defaultRiskRatio ||
                    new RiskRatio(zero, RiskRatio.TYPE.LTV),
                } as OpenMultiplyAaveParameters,
              }
            }
          },
          { to: (context) => context.refParametersMachine! },
        ),
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
              spender: context.effectiveProxyAddress!,
              allowanceType: 'unlimited',
              minimumAmount: context.userInput.amount!,
              runWithEthers: context.strategyConfig.executeTransactionWith === 'ethers',
              signer: (context.web3Context as ContextConnected)?.transactionProvider,
              networkId: context.strategyConfig.networkId,
            }),
            'allowanceMachine',
          ),
        })),
        calculateEffectiveProxyAddress: assign((context) => {
          if (context.blockSettingCalculatedAddresses) {
            return {}
          }

          const shouldUseDpmProxy =
            context.strategyConfig.proxyType === ProxyType.DpmProxy &&
            context.userDpmAccount !== undefined

          const proxyAddressToUse = shouldUseDpmProxy
            ? context.userDpmAccount?.proxy
            : context.connectedProxyAddress

          const contextConnected = context.web3Context as any as ContextConnected | undefined

          const address = shouldUseDpmProxy
            ? `/${context.strategyConfig.network}/${mapAaveLikeUrlSlug(
                context.strategyConfig.protocol,
              )}/${mapAaveLikeProtocol(context.strategyConfig.protocol)}/${
                context.userDpmAccount?.vaultId
              }`
            : `/${context.strategyConfig.network}/${mapAaveLikeUrlSlug(
                context.strategyConfig.protocol,
              )}/${mapAaveLikeProtocol(context.strategyConfig.protocol)}/${
                contextConnected?.account
              }`

          return {
            effectiveProxyAddress: proxyAddressToUse,
            positionRelativeAddress: address,
          }
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
        setFallbackTokenPrice: assign((context, event) => {
          // fallback if we don't have the tokenPrice - happens if no
          // wallet is connected (tokenBalance and tokenPrice are updated in SET_BALANCE)
          let fallbackPrice: BigNumber
          switch (true) {
            case context.tokens.deposit === context.tokens.collateral:
              fallbackPrice = event.collateralPrice
              break
            case context.tokens.deposit === context.tokens.debt:
              fallbackPrice = event.debtPrice
              break
            default:
              throw new Error(
                `could not set fallback price for deposit token ${context.tokens.deposit}`,
              )
          }
          return {
            tokenPrice: context.tokenPrice ? context.tokenPrice : fallbackPrice,
          }
        }),
        resetWalletValues: assign((context) => {
          if (context.web3Context === undefined || context.web3Context.account === undefined) {
            return {
              tokenBalance: undefined,
              tokenPrice: undefined,
            }
          }
          return {}
        }),
        disableChangingAddresses: assign((_) => {
          return {
            blockSettingCalculatedAddresses: true,
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
        updateStopLossInitialState: assign((context) => {
          const { proxyAddress, debtTokenAddress, collateralTokenAddress } =
            extractStopLossDataInput(context)
          const stopLossLevel = context
            .reserveConfig!.liquidationThreshold.minus(aaveOffsets.open.max)
            .times(100)

          const commandContractType = getAaveLikeCommandContractType(
            context.strategyConfig.protocol,
          )
          return {
            stopLossLevel,
            stopLossTxData: {
              ...prepareStopLossTriggerDataV2(
                commandContractType,
                proxyAddress!,
                getAaveLikeStopLossTriggerType(context.strategyConfig.protocol),
                false,
                stopLossLevel,
                debtTokenAddress!,
                collateralTokenAddress!,
              ),
              replacedTriggerIds: [0],
              replacedTriggersData: ['0x'],
              kind: TxMetaKind.addTrigger,
            } as AutomationAddTriggerData,
          }
        }),
        sendSigner: sendTo(
          (context) => context.refParametersMachine!,
          (context) => {
            return {
              type: 'SIGNER_CHANGED',
              signer: (context.web3Context as ContextConnected)?.transactionProvider,
            }
          },
        ),
      },
    },
  )
}

export type OpenAaveStateMachineWithoutConfiguration = ReturnType<typeof createOpenAaveStateMachine>
export type OpenAaveStateMachine = ReturnType<
  OpenAaveStateMachineWithoutConfiguration['withConfig']
>

export type OpenAaveStateMachineServices = MachineOptionsFrom<
  OpenAaveStateMachineWithoutConfiguration,
  true
>['services']
