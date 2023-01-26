import { RiskRatio } from '@oasisdex/oasis-actions'
import { trackingEvents } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { ethNullAddress } from 'blockchain/config'
import { isUserWalletConnected } from 'features/aave/helpers/isUserWalletConnected'
import { convertDefaultRiskRatioToActualRiskRatio } from 'features/aave/strategyConfig'
import { ActorRefFrom, assign, createMachine, send, spawn } from 'xstate'
import { pure } from 'xstate/lib/actions'
import { MachineOptionsFrom } from 'xstate/lib/types'

import { AaveReserveConfigurationData } from '../../../../blockchain/calls/aave/aaveProtocolDataProvider'
import { TransactionDef } from '../../../../blockchain/calls/callsHelpers'
import {
  callOperationExecutorWithDpmProxy,
  callOperationExecutorWithDsProxy,
  OperationExecutorTxMeta,
} from '../../../../blockchain/calls/operationExecutor'
import { ContextConnected } from '../../../../blockchain/network'
import { allDefined } from '../../../../helpers/allDefined'
import { zero } from '../../../../helpers/zero'
import { AllowanceStateMachine } from '../../../stateMachines/allowance'
import { createDPMAccountStateMachine } from '../../../stateMachines/dpmAccount'
import {
  DMPAccountStateMachineResultEvents,
  DPMAccountStateMachine,
} from '../../../stateMachines/dpmAccount/state/createDPMAccountStateMachine'
import { ProxyResultEvent, ProxyStateMachine } from '../../../stateMachines/proxy/state'
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
import { IStrategyConfig, ProxyType } from '../../common/StrategyConfigTypes'
import { OpenAaveParameters } from '../../oasisActionsLibWrapper'

export const totalStepsMap = {
  base: 2,
  proxySteps: (needCreateProxy: boolean) => (needCreateProxy ? 2 : 0),
  allowanceSteps: (needAllowance: boolean) => (needAllowance ? 1 : 0),
}

export interface OpenAaveContext extends BaseAaveContext {
  refProxyMachine?: ActorRefFrom<ProxyStateMachine>
  refDpmAccountMachine?: ActorRefFrom<ReturnType<typeof createDPMAccountStateMachine>>
  refTransactionMachine?: ActorRefFrom<TransactionStateMachine<OperationExecutorTxMeta>>
  refParametersMachine?: ActorRefFrom<TransactionParametersStateMachine<OpenAaveParameters>>
  hasOpenedPosition?: boolean
  strategyConfig: IStrategyConfig
  positionRelativeAddress?: string
  blockSettingCalculatedAddresses?: boolean
  reserveConfig?: AaveReserveConfigurationData
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
  | { type: 'RESERVE_CONFIG_UPDATED'; reserveConfig: AaveReserveConfigurationData }
  | BaseAaveEvent
  | ProxyResultEvent
  | DMPAccountStateMachineResultEvents

export function createOpenAaveStateMachine(
  transactionParametersMachine: TransactionParametersStateMachine<OpenAaveParameters>,
  proxyStateMachine: ProxyStateMachine,
  dmpAccountStateMachine: DPMAccountStateMachine,
  allowanceStateMachine: AllowanceStateMachine,
  transactionStateMachine: (
    transactionParameters: OperationExecutorTxMeta,
    transactionDef: TransactionDef<OperationExecutorTxMeta>,
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
          src: 'protocolData$',
          id: 'protocolData$',
        },
        {
          src: 'allowance$',
          id: 'allowance$',
        },
        {
          src: 'aaveReserveConfiguration$',
          id: 'aaveReserveConfiguration$',
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
                SET_AMOUNT: {
                  target: '#openAaveStateMachine.background.debouncing',
                  actions: ['setAmount', 'calculateAuxiliaryAmount'],
                },
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
              entry: [
                'eventConfirmTransaction',
                'spawnTransactionMachine',
                'disableChangingAddresses',
              ],
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
          actions: ['resetWalletValues', 'updateContext', 'calculateEffectiveProxyAddress'],
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
        UPDATE_ALLOWANCE: {
          actions: 'updateContext',
        },
        DPM_PROXY_RECEIVED: {
          actions: ['updateContext', 'calculateEffectiveProxyAddress', 'setTotalSteps'],
        },
        RESERVE_CONFIG_UPDATED: {
          actions: ['updateContext', 'setDefaultRiskRatio'],
        },
      },
    },
    {
      guards: {
        shouldCreateDpmProxy: (context) =>
          context.strategyConfig.proxyType === ProxyType.DpmProxy && !context.userDpmAccount,
        shouldCreateDsProxy: (context) =>
          context.strategyConfig.proxyType === ProxyType.DsProxy && !context.connectedProxyAddress,
        validTransactionParameters: ({ userInput, effectiveProxyAddress, strategy }) =>
          allDefined(userInput, effectiveProxyAddress, strategy),
        canOpenPosition: ({ tokenBalance, userInput, effectiveProxyAddress, hasOpenedPosition }) =>
          allDefined(tokenBalance, userInput.amount, effectiveProxyAddress, !hasOpenedPosition) &&
          tokenBalance!.gte(userInput.amount!),
        isAllowanceNeeded,
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

          const totalSteps =
            totalStepsMap.base +
            totalStepsMap.proxySteps(proxy) +
            totalStepsMap.allowanceSteps(allowance)
          return {
            totalSteps: totalSteps,
          }
        }),
        setAmount: assign((context, event) => ({
          userInput: {
            ...context.userInput,
            amount: event.amount,
          },
          strategy: event.amount ? context.strategy : undefined,
        })),
        setDebt: assign((context, event) => ({
          userInput: {
            ...context.userInput,
            debtAmount: event.debt,
          },
          strategy: event.debt ? context.strategy : undefined,
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
        updateContext: assign((_, event) => {
          console.log(`update context, current context amount: ${_.userInput.amount}`)
          console.log(`update context, aux amount: ${_.auxiliaryAmount}`)
          console.log(`update context, event: ${event.toString()}`)
          return {
            ...event,
          }
        }),
        spawnProxyMachine: assign((_) => ({
          refProxyMachine: spawn(proxyStateMachine, 'dsProxyStateMachine'),
        })),
        killProxyMachine: pure((context) => {
          if (context.refProxyMachine && context.refProxyMachine.stop) {
            context.refProxyMachine.stop()
          }
          return undefined
        }),
        spawnDpmProxyMachine: assign((_) => ({
          refDpmAccountMachine: spawn(dmpAccountStateMachine, 'dmpAccountStateMachine'),
        })),
        killDpmProxyMachine: pure((context) => {
          if (context.refDpmAccountMachine && context.refDpmAccountMachine.stop) {
            context.refDpmAccountMachine.stop()
          }
          return undefined
        }),
        spawnParametersMachine: assign((_) => ({
          refParametersMachine: spawn(transactionParametersMachine, 'transactionParameters'),
        })),
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
        requestParameters: send(
          (context): TransactionParametersStateMachineEvent<OpenAaveParameters> => {
            return {
              type: 'VARIABLES_RECEIVED',
              parameters: {
                amount: context.userInput.amount!,
                riskRatio:
                  context.userInput.riskRatio ||
                  context.defaultRiskRatio ||
                  new RiskRatio(zero, RiskRatio.TYPE.LTV),
                // ethNullAddress just for the simulation, theres a guard for that
                proxyAddress: context.effectiveProxyAddress! || ethNullAddress,
                collateralToken: context.strategyConfig.tokens.collateral,
                debtToken: context.tokens.debt,
                depositToken: context.tokens.deposit,
                token: context.tokens.deposit,
                context: context.web3Context!,
                slippage: context.userSettings!.slippage,
                proxyType: context.strategyConfig.proxyType,
                positionType: context.strategyConfig.type,
              },
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

          const contextConnected = (context.web3Context as any) as ContextConnected | undefined

          const address = shouldUseDpmProxy
            ? `/aave/${context.userDpmAccount?.vaultId}`
            : `/aave/${contextConnected?.account}`

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
          return {
            // fallback if we dont have the tokenPrice - happens if no
            // wallet is connected (tokenBalance and tokenPrice are updated in SET_BALANCE)
            tokenPrice: context.tokenPrice ? context.tokenPrice : event.collateralPrice,
          }
        }),
        resetWalletValues: assign((context) => {
          if (!isUserWalletConnected(context)) {
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
