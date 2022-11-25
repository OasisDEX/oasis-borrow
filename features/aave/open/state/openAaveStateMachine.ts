import { trackingEvents } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { ActorRefFrom, assign, createMachine, send, spawn, StateFrom } from 'xstate'
import { pure } from 'xstate/lib/actions'
import { MachineOptionsFrom } from 'xstate/lib/types'

import { OperationExecutorTxMeta } from '../../../../blockchain/calls/operationExecutor'
import { allDefined } from '../../../../helpers/allDefined'
import { zero } from '../../../../helpers/zero'
import { ProxyResultEvent, ProxyStateMachine } from '../../../proxyNew/state'
import { TransactionStateMachine } from '../../../stateMachines/transaction'
import {
  TransactionParametersStateMachine,
  TransactionParametersStateMachineEvent,
} from '../../../stateMachines/transactionParameters'
import {
  BaseAaveContext,
  BaseAaveEvent,
  contextToTransactionParameters,
} from '../../common/BaseAaveContext'
import { StrategyConfig } from '../../common/StrategyConfigTypes'
import { OpenAaveParameters } from '../../oasisActionsLibWrapper'
export const STEPS_WITH_PROXY_CREATION = 5
export const STEPS_WITHOUT_PROXY_CREATION = 3

export interface OpenAaveContext extends BaseAaveContext {
  refProxyMachine?: ActorRefFrom<ProxyStateMachine>
  refTransactionMachine?: ActorRefFrom<TransactionStateMachine<OperationExecutorTxMeta>>
  refParametersMachine?: ActorRefFrom<TransactionParametersStateMachine<OpenAaveParameters>>

  hasOpenedPosition?: boolean
  strategyConfig: StrategyConfig
}

export type OpenAaveEvent =
  | { type: 'BACK_TO_EDITING' }
  | { type: 'RETRY' }
  | { type: 'SET_AMOUNT'; amount: BigNumber }
  | { type: 'NEXT_STEP' }
  | { type: 'UPDATE_META_INFO'; hasOpenedPosition: boolean }
  | BaseAaveEvent
  | ProxyResultEvent

export function createOpenAaveStateMachine(
  transactionParametersMachine: TransactionParametersStateMachine<OpenAaveParameters>,
  proxyMachine: ProxyStateMachine,
  transactionStateMachine: (
    transactionParameters: OperationExecutorTxMeta,
  ) => TransactionStateMachine<OperationExecutorTxMeta>,
) {
  /** @xstate-layout N4IgpgJg5mDOIC5QHsAOYB2BBAhgNzAGUAXHYsAWRwGMALASwzADoAbZHCRqAYgGEA8gDkhAUT4AVUQBEA+oKFSAGhPkAJLEIDiMgNoAGALqJQqZLHrF6yDCZAAPRAFoAzABZ9zAGxuAjAA4AVgB2N2CATn99F18AGhAAT2d-f19vQJcvQMjfcLcPfwBfQvi0TFwCEjJKGgYmZkhLbmYIMAAjZABXDGpuHntYUnJmHAAzcgAnAApA-X0ASh4y7HwiIZq6RhZGqwwoFvaunu4DYyQQMwsrGztHBBd-L29gwK9fACZ9d+DfOff4pIIJwZYLMQK+F7hQLvFwvLxeIolEDLCprapUTb1HZ9QiiVRYCgCACqilOdkuTRu5zuCOY7mCCNhuQZgUCbgByXebmY73evlec38wWivl8xVK6BWlXWGLq2y4u14YhUskIUgACmTzhTrrZqYhRcF3nSfi4YQ99I8XIEOUC8i5mBCvKa8uF9G9ERLyqsquRZVsGgq+srVGrRJrfGdTOZKXrQHdfNanuFeXyvOEvNa3P9Es4IqC8pngsXWSlWeLkZLUb6NnLA009jwJAAlTSELCSACSwlk6qwrYoeNEzcIsmb4lEnYAanojOSY7rbohhU9-Bb-Hl-N99C9bU4gsahXzfD4XOEYvo3BWUT6ZbUA6gJsh7Ak+BMwGQ+urmwIlABNeRxywKRpC1aMrmsOMHANfQ8mYUIvndI19FFIU918Nx-DBeF8h+S8QUya8q1vdF73qWAwGIRUKE6VgrFQVgWFaDpul6RsBnWEZxjAaZZgWJZiOlUjMRYCiqO4Gi6PoBimMOViTjnbUF0gpcEBhflvBcFwUK3D53g3Pc3GdZg3FmE83BTNwHlmK8kRvIS-TI0TKOo2j6MYngiXVaRgNEVUW18rQAM7IQADEBDAi5lKpeNEE+GJvG+QJUkvN1wmCPdgi3ZgUzNS13RTA8iO9BzawDMTXKkmTPO83zZEHCQsFkELwsinUVP1NTvjSAJYMzTMvi5TLstyz4onTfTwWKqU0UckTmAqiS3OkjzcVUZtO0IABpMdgO7Nroqgu4uWCB1cjPMI2QeKIXGG41RvyiagjFOzBNmsryJcpaqo88c1rHTadtbCR9sU8DY1U94fGNLNj15WEUPZXMgSy+6YU+KGzVMwJpurO95sWvZJPcsAm1bIR2y7Hs+wHIcRzHCdp1nKMoogmLoLUtdQSyIJUmFT4jKRwEnFRnL1PS3JXi5cJcZIua60JqBiZW0mQ388MDrZqDha8HceSNNMIgRXcOcTN4ctmdwdzZDwPll0r-U+8SieW6qACEOx2iQBFkGROxB7RNYhzqze5TNYUeD4D1ePdjcdDcvH0qGM0vF6vRmmtHZYd88HoMAAHdg1EFUw01MHWeD2KEETLTmC5xN7VRnNATNQ8MiiNkISCGIcdekr3qz5gc7zwvGw9vgvZ9v2A60IPF06-xTLBXlTOhyIIhtZGzRyiF3TPRe1yMtPK37zOnKHsBc4LvoAopjsQep-sCTp0dxz4ScZ1A8v2vZhM13Cbw8Jshcl1t8cItouTLzZChVKKETzuHtgPc+xB7CdgwOqJ8UB3ywFgDwCANgWCMDwMgAA1iwYgEwcAYFgDQXUc8OpVw+AlDCAQo5vDdCbQE8IAEMkXtpAI0IZZ9wzvjOsKC0EYOQFguAuCeJPgmMwBiZBRjIAmAAW2YBQqhNDqB0O-odVSGFsw8kvO8Vk6V3SPE3lwnwJo8jFlOomLc7xEFn3mig0KOB6CsE6O+Hg44Wx-nob-RAIQniYUThEHc7xwjnltB8XWddWSnT3rCHCrjREBg8V4nxfjx6T19tIf2IVZ76K1qpU6oJPhugRJbdM0J4koQdPCE8UMrRZSyBk4ScoeDfk7O-V+jNP7BKOogGIxo3i8ndNEzCO50KmW5BZGJkRE7Zg7l0+WWxPK4mbKqPEM9Rx8A0NoZm85ykhxhJ4E8TCMimUlrdZGTgMKwjru6FeBQsimQ2R9Um-0PYABlNDvxGYYtkoIjSZgzBeXSGVHkYShjyN01ooRvHyC44ReNulbO-L+ACWBpDSD+oM9+TMv4sx-qMhAKZPB8mLN8GI6UET+HmbSTCHxQjCicUI9OmLNlMH4MIMQkgZDyGEMoVQRzNA6DJWcyuHNXhpDCM6UUusUxZVhcLDCbITIpliY8Lk+l9C9yRBgZArR4DnHskg+a7BODcFlfPKuTguRYXBOePKnymQaucOmbk0RYRmLZEKV03zB7Yj2MwegEBGIOoYRzcIPUYiZFhBkT4vwHnC0FvBd02ZQh+DdPkXuPK5Y-PrIqA4LFjh7FjSE+4jwTK0rgcGlJQs8z1tCHxTM2RUhTQxSWsNQYI22q4NWpS5yq7giwieeE1SgH9VjhufWKQrJdsXka0N59w1QBrZSz4dIlX10ZayVtdpF1HksVEMxlSN3zUfM+V875PyjvBo602sEAHgjMdEbIrIvjeqBDEzwkKMIbj5OlLKtli0O3PorZWMlI3RrADuyGUK67njMbyDhKq9zaSeDCVkUtk74a8DehWX0XY-VkpWti26x1yuOj3OxvxKkxDeBm5wrJwlhGtE6TCKbSPlXI0rV2jE2AcBHbRl9cbjpQyeFpeGVlXjOiGo8xjbLLQpBPEKcsfboMEyE3BmNdHX0JkiM0pKKULKwX-U4dKDpRrPJ8FkdKAn6jD2vkO8T9rjPSYNFZsEwDVXnthPErCcwXjFjXTECJJHdPWrrO50e+wo1Gak7W5kQGkoC1SLyZlyMIQOiyjXLGZjszfFc9nS+I9vNpcpUY405ioawWCzZ1COVLK9QhMlFFFXNGoPQZg7BFrauGOsvBXkrJerqosrafIngLr+uiV2ncvXsneN8Uhnz6WLKBHglZHLGF0wMi8Lac8u2PDdrmBhDt6KoPxayfYQgnRqDUBkchzq55PBGtMpEPwaTYK2m4TyBEfgQhQiNTEir72nXXW8H4IIHLIginQlDNI56IgpFSuV4ohQgA */
  return createMachine(
    {
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
          src: 'protocolData$',
          id: 'protocolData$',
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
              entry: 'resetCurrentStep',
              on: {
                SET_AMOUNT: {
                  target: '#openAaveStateMachine.background.debouncing',
                  actions: ['setAmount', 'calculateAuxiliaryAmount'],
                },
                NEXT_STEP: [
                  {
                    target: 'proxyCreating',
                    cond: 'hasProxy',
                    actions: 'incrementCurrentStep',
                  },
                  {
                    target: 'settingMultiple',
                    cond: 'canOpenPosition',
                    actions: 'incrementCurrentStep',
                  },
                ],
              },
            },
            proxyCreating: {
              entry: ['spawnProxyMachine'],
              exit: ['killProxyMachine'],
              on: {
                PROXY_CREATED: {
                  target: 'editing',
                  actions: 'updateContext',
                },
              },
            },
            settingMultiple: {
              entry: 'eventConfirmDeposit',
              on: {
                SET_RISK_RATIO: {
                  target: '#openAaveStateMachine.background.debouncing',
                  actions: 'setRiskRatio',
                },
                RESET_RISK_RATIO: {
                  target: '#openAaveStateMachine.background.debouncing',
                  actions: 'resetRiskRatio',
                },
                NEXT_STEP: {
                  target: 'reviewing',
                  cond: 'validTransactionParameters',
                  actions: 'incrementCurrentStep',
                },
                BACK_TO_EDITING: {
                  target: 'editing',
                },
              },
            },
            reviewing: {
              entry: 'eventConfirmRiskRatio',
              on: {
                NEXT_STEP: {
                  target: 'txInProgress',
                  cond: 'validTransactionParameters',
                },
                BACK_TO_EDITING: {
                  target: 'editing',
                  actions: 'decrementCurrentStep',
                },
              },
            },
            txInProgress: {
              entry: ['eventConfirmTransaction', 'spawnTransactionMachine'],
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
                  target: 'editing',
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
          actions: ['updateContext', 'setTotalSteps'],
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
        UPDATE_META_INFO: {
          actions: 'updateContext',
        },
        UPDATE_PROTOCOL_DATA: {
          actions: 'updateContext',
        },
      },
    },
    {
      guards: {
        hasProxy: ({ connectedProxyAddress }) => !allDefined(connectedProxyAddress),
        validTransactionParameters: ({
          userInput,
          connectedProxyAddress,
          strategy,
          operationName,
        }) => allDefined(userInput, connectedProxyAddress, strategy, operationName),
        canOpenPosition: ({ tokenBalance, userInput, connectedProxyAddress, hasOpenedPosition }) =>
          allDefined(tokenBalance, userInput.amount, connectedProxyAddress, !hasOpenedPosition) &&
          tokenBalance!.gt(userInput.amount!),
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
              riskRatio: context.strategyConfig.riskRatios.default,
            },
          }
        }),
        setTotalSteps: assign((_, event) => ({
          totalSteps:
            event.connectedProxyAddress === undefined
              ? STEPS_WITH_PROXY_CREATION
              : STEPS_WITHOUT_PROXY_CREATION,
        })),
        setAmount: assign((context, event) => {
          return {
            userInput: {
              ...context.userInput,
              amount: event.amount,
            },
          }
        }),
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
        })),
        eventConfirmDeposit: ({ userInput }) => {
          userInput.amount && trackingEvents.earn.stETHOpenPositionConfirmDeposit(userInput.amount)
        },
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
          refProxyMachine: spawn(proxyMachine),
        })),
        killProxyMachine: pure((context) => {
          if (context.refProxyMachine && context.refProxyMachine.stop) {
            context.refProxyMachine.stop()
          }
          return undefined
        }),
        spawnParametersMachine: assign((_) => ({
          refParametersMachine: spawn(transactionParametersMachine, 'transactionParameters'),
        })),
        spawnTransactionMachine: assign((context) => ({
          refTransactionMachine: spawn(
            transactionStateMachine(contextToTransactionParameters(context)),
            'transactionMachine',
          ),
        })),
        killTransactionMachine: pure((context) => {
          if (context.refTransactionMachine && context.refTransactionMachine.stop) {
            context.refTransactionMachine.stop()
          }
          return undefined
        }),
        requestParameters: send(
          (context): TransactionParametersStateMachineEvent<OpenAaveParameters> => {
            return {
              type: 'VARIABLES_RECEIVED',
              parameters: {
                amount: context.userInput.amount!,
                riskRatio: context.userInput.riskRatio || context.strategyConfig.riskRatios.default,
                proxyAddress: context.connectedProxyAddress!,
                collateralToken: context.strategyConfig.tokens.collateral,
                debtToken: context.tokens.debt,
                depositToken: context.tokens.deposit,
                context: context.web3Context!,
                slippage: context.userSettings!.slippage,
              },
            }
          },
          { to: (context) => context.refParametersMachine! },
        ),
      },
    },
  )
}

class OpenAaveStateMachineTypes {
  needsConfiguration() {
    return createOpenAaveStateMachine({} as any, {} as any, {} as any)
  }

  withConfig() {
    // @ts-ignore
    return createOpenAaveStateMachine().withConfig({})
  }
}

export type OpenAaveStateMachineWithoutConfiguration = ReturnType<
  OpenAaveStateMachineTypes['needsConfiguration']
>
export type OpenAaveStateMachine = ReturnType<OpenAaveStateMachineTypes['withConfig']>

export type OpenAaveStateMachineServices = MachineOptionsFrom<
  OpenAaveStateMachineWithoutConfiguration,
  true
>['services']

export type OpenAaveStateMachineState = StateFrom<OpenAaveStateMachine>
