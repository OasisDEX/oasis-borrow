import type { AaveLikePosition } from '@oasisdex/dma-library'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { amountFromWei } from 'blockchain/utils'
import type { ethers } from 'ethers'
import type { IStrategyConfig } from 'features/aave/types'
import { StrategyType } from 'features/aave/types'
import { AutomationFeatures } from 'features/automation/common/types'
import { omniPositionTriggersDataDefault } from 'features/omni-kit/constants'
import { isAnyValueDefined } from 'helpers/isAnyValueDefined'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { getTriggersRequest } from 'helpers/lambda/triggers'
import { LendingProtocol } from 'lendingProtocols'
import type { ActorRefFrom, StateFrom } from 'xstate'
import { actions, createMachine } from 'xstate'

import type {
  autoBuyTriggerAaveStateMachine,
  autoSellTriggerAaveStateMachine,
} from './getBasicAutomationAaveStateMachine'
import type { PositionLike } from './triggersCommon'

const { assign, sendTo } = actions

export type ProtectionTriggersViews =
  | 'auto-sell'
  | 'stop-loss-selector'
  | 'stop-loss'
  | 'trailing-stop-loss'

export type OptimizationTriggersViews = 'auto-buy' | 'partial-take-profit' | undefined

export type TriggersAaveEvent =
  | { type: 'CHANGE_PROTECTION_VIEW'; view: ProtectionTriggersViews }
  | { type: 'SHOW_AUTO_BUY' }
  | { type: 'SHOW_PARTIAL_TAKE_PROFIT' }
  | { type: 'RESET_PROTECTION' }
  | { type: 'POSITION_UPDATED'; position: AaveLikePosition }
  | { type: 'TRIGGERS_UPDATED'; currentTriggers: GetTriggersResponse }
  | { type: 'SIGNER_UPDATED'; signer?: ethers.Signer }
  | { type: 'TRANSACTION_DONE' }

export type TriggersAaveContext = {
  readonly strategyConfig: IStrategyConfig
  readonly dpm?: UserDpmAccount
  position?: AaveLikePosition
  optimizationCurrentView?: OptimizationTriggersViews
  showAutoBuyBanner: boolean
  showPartialTakeProfitBanner: boolean
  protectionCurrentView?: ProtectionTriggersViews
  currentTriggers: GetTriggersResponse
  signer?: ethers.Signer
  autoBuyTrigger: ActorRefFrom<typeof autoBuyTriggerAaveStateMachine>
  autoSellTrigger: ActorRefFrom<typeof autoSellTriggerAaveStateMachine>
}

export const isOptimizationEnabled = ({
  context,
}: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  return context.strategyConfig.isAutomationFeatureEnabled(AutomationFeatures.AUTO_BUY)
}

export const isAutoSellEnabled = ({
  context,
}: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  return (
    context.strategyConfig.isAutomationFeatureEnabled(AutomationFeatures.AUTO_SELL) &&
    context.dpm !== undefined
  )
}

export const getCurrentOptimizationView = ({
  triggers,
}: GetTriggersResponse): 'auto-buy' | 'partial-take-profit' | undefined => {
  if (triggers.aave3.basicBuy || triggers.spark.basicBuy) {
    return 'auto-buy'
  }
  if (triggers.aave3.partialTakeProfit || triggers.spark.partialTakeProfit) {
    return 'partial-take-profit'
  }
  return undefined
}

export const getCurrentProtectionView = ({
  triggers,
}: GetTriggersResponse): 'auto-sell' | 'stop-loss' | 'trailing-stop-loss' | undefined => {
  if (
    triggers.aave3.stopLossToCollateral ||
    triggers.aave3.stopLossToCollateralDMA ||
    triggers.aave3.stopLossToDebt ||
    triggers.aave3.stopLossToDebtDMA ||
    triggers.spark.stopLossToCollateral ||
    triggers.spark.stopLossToCollateralDMA ||
    triggers.spark.stopLossToDebt ||
    triggers.spark.stopLossToDebtDMA
  ) {
    return 'stop-loss'
  }

  if (triggers.aave3.basicSell || triggers.spark.basicSell) {
    return 'auto-sell'
  }

  if (triggers.aave3.trailingStopLossDMA || triggers.spark.trailingStopLossDMA) {
    return 'trailing-stop-loss'
  }

  return undefined
}

export const areTriggersLoading = (state: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  return state.matches('loading')
}

export const hasActiveOptimization = ({
  context,
}: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  const hasAaveAutoBuyEnabled = context.currentTriggers.triggers.aave3.basicBuy !== undefined
  const hasSparkAutoBuyEnabled = context.currentTriggers.triggers.spark.basicBuy !== undefined

  const hasAavePartialTakeProfitEnabled =
    context.currentTriggers.triggers.aave3.partialTakeProfit !== undefined
  const hasSparkPartialTakeProfitEnabled =
    context.currentTriggers.triggers.spark.partialTakeProfit !== undefined

  return (
    hasAaveAutoBuyEnabled ||
    hasSparkAutoBuyEnabled ||
    hasAavePartialTakeProfitEnabled ||
    hasSparkPartialTakeProfitEnabled
  )
}

export const hasActiveProtection = ({
  context,
}: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  const protocol = context.strategyConfig.protocol

  switch (protocol) {
    case LendingProtocol.AaveV3: {
      const {
        basicSell,
        stopLossToCollateral,
        stopLossToCollateralDMA,
        stopLossToDebt,
        stopLossToDebtDMA,
        trailingStopLossDMA,
      } = context.currentTriggers.triggers.aave3

      return isAnyValueDefined(
        basicSell,
        stopLossToCollateral,
        stopLossToCollateralDMA,
        stopLossToDebt,
        stopLossToDebtDMA,
        trailingStopLossDMA,
      )
    }
    case LendingProtocol.SparkV3: {
      const {
        basicSell,
        stopLossToCollateral,
        stopLossToCollateralDMA,
        stopLossToDebt,
        stopLossToDebtDMA,
        trailingStopLossDMA,
      } = context.currentTriggers.triggers.spark

      return isAnyValueDefined(
        basicSell,
        stopLossToCollateral,
        stopLossToCollateralDMA,
        stopLossToDebt,
        stopLossToDebtDMA,
        trailingStopLossDMA,
      )
    }
    case LendingProtocol.AaveV2:
      return false
  }
}

export const hasActiveStopLossFromTriggers = ({
  triggers,
  protocol,
}: {
  triggers: GetTriggersResponse['triggers']
  protocol: LendingProtocol
}) => {
  switch (protocol) {
    case LendingProtocol.AaveV3: {
      const { stopLossToCollateral, stopLossToCollateralDMA, stopLossToDebt, stopLossToDebtDMA } =
        triggers.aave3

      return isAnyValueDefined(
        stopLossToCollateral,
        stopLossToCollateralDMA,
        stopLossToDebt,
        stopLossToDebtDMA,
      )
    }
    case LendingProtocol.SparkV3: {
      const { stopLossToCollateral, stopLossToCollateralDMA, stopLossToDebt, stopLossToDebtDMA } =
        triggers.spark

      return isAnyValueDefined(
        stopLossToCollateral,
        stopLossToCollateralDMA,
        stopLossToDebt,
        stopLossToDebtDMA,
      )
    }
    case LendingProtocol.AaveV2:
      return false
  }
  return false
}

export const hasActiveStopLossFromContext = ({
  context,
}: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  const protocol = context.strategyConfig.protocol

  switch (protocol) {
    case LendingProtocol.AaveV3: {
      const { stopLossToCollateral, stopLossToCollateralDMA, stopLossToDebt, stopLossToDebtDMA } =
        context.currentTriggers.triggers.aave3

      return isAnyValueDefined(
        stopLossToCollateral,
        stopLossToCollateralDMA,
        stopLossToDebt,
        stopLossToDebtDMA,
      )
    }
    case LendingProtocol.SparkV3: {
      const { stopLossToCollateral, stopLossToCollateralDMA, stopLossToDebt, stopLossToDebtDMA } =
        context.currentTriggers.triggers.spark

      return isAnyValueDefined(
        stopLossToCollateral,
        stopLossToCollateralDMA,
        stopLossToDebt,
        stopLossToDebtDMA,
      )
    }
    case LendingProtocol.AaveV2:
      return false
  }
}

export const hasActiveTrailingStopLossFromTriggers = ({
  triggers,
  protocol,
}: {
  triggers: GetTriggersResponse['triggers']
  protocol: LendingProtocol
}) => {
  switch (protocol) {
    case LendingProtocol.AaveV3: {
      const { trailingStopLossDMA } = triggers.aave3

      return isAnyValueDefined(trailingStopLossDMA)
    }
    case LendingProtocol.SparkV3: {
      const { trailingStopLossDMA } = triggers.spark

      return isAnyValueDefined(trailingStopLossDMA)
    }
    case LendingProtocol.AaveV2:
      return false
  }
  return false
}

export const hasActiveTrailingStopLossFromContext = ({
  context,
}: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  const protocol = context.strategyConfig.protocol

  switch (protocol) {
    case LendingProtocol.AaveV3: {
      const { trailingStopLossDMA } = context.currentTriggers.triggers.aave3

      return isAnyValueDefined(trailingStopLossDMA)
    }
    case LendingProtocol.SparkV3: {
      const { trailingStopLossDMA } = context.currentTriggers.triggers.spark

      return isAnyValueDefined(trailingStopLossDMA)
    }
    case LendingProtocol.AaveV2:
      return false
  }
}

export const hasActiveAutoSell = ({
  context,
}: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  const protocol = context.strategyConfig.protocol

  switch (protocol) {
    case LendingProtocol.AaveV3: {
      const { basicSell } = context.currentTriggers.triggers.aave3

      return isAnyValueDefined(basicSell)
    }
    case LendingProtocol.SparkV3: {
      const { basicSell } = context.currentTriggers.triggers.spark

      return isAnyValueDefined(basicSell)
    }
    case LendingProtocol.AaveV2:
      return false
  }
}

export const hasActivePartialTakeProfit = ({
  context,
}: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  const protocol = context.strategyConfig.protocol

  switch (protocol) {
    case LendingProtocol.AaveV3: {
      const { partialTakeProfit } = context.currentTriggers.triggers.aave3

      return isAnyValueDefined(partialTakeProfit)
    }
    case LendingProtocol.SparkV3: {
      const { partialTakeProfit } = context.currentTriggers.triggers.spark

      return isAnyValueDefined(partialTakeProfit)
    }
    case LendingProtocol.AaveV2:
      return false
  }
}

function mapPositionToAutoBuyPosition({
  position,
  dpm,
  strategyConfig,
}: {
  position: AaveLikePosition
  dpm?: UserDpmAccount
  strategyConfig: IStrategyConfig
}): PositionLike | undefined {
  if (!dpm) {
    return undefined
  }
  return {
    ltv: position.riskRatio.loanToValue.times(100).toNumber(),
    collateral: {
      token: {
        symbol: position.collateral.symbol,
        address: position.collateral.address,
        decimals: position.collateral.precision,
      },
      amount: amountFromWei(position.collateral.amount, position.collateral.precision),
    },
    debt: {
      token: {
        symbol: position.debt.symbol,
        address: position.debt.address,
        decimals: position.debt.precision,
      },
      amount: amountFromWei(position.debt.amount, position.debt.precision),
    },
    dpm: dpm.proxy,
    protocol: strategyConfig.protocol,
    pricesDenomination: strategyConfig.strategyType === StrategyType.Short ? 'debt' : 'collateral',
  }
}

export const triggersAaveStateMachine = createMachine(
  {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import('./triggersAaveStateMachine.typegen').Typegen0,
    schema: {
      context: {} as TriggersAaveContext,
      events: {} as TriggersAaveEvent,
      services: {} as {
        getTriggers: {
          data: GetTriggersResponse
        }
      },
    },
    preserveActionOrder: true,
    predictableActionArguments: true,
    entry: [],
    id: 'triggersStateMachine',
    initial: 'loading',
    states: {
      idle: {
        on: {
          SHOW_AUTO_BUY: {
            actions: ['setAutoBuyView'],
          },
          SHOW_PARTIAL_TAKE_PROFIT: {
            actions: ['setPartialTakeProfitView'],
          },
          CHANGE_PROTECTION_VIEW: {
            actions: ['changeView'],
          },
          RESET_PROTECTION: {
            actions: ['resetProtection'],
          },
        },
      },
      loading: {
        invoke: [
          {
            src: 'getTriggers',
            id: 'getTriggers',
            onDone: {
              target: 'idle',
              actions: [
                'updateTriggers',
                'sendAutoBuyTrigger',
                'sendAutoSellTrigger',
                'updateCurrentViews',
              ],
            },
          },
        ],
      },
    },
    on: {
      POSITION_UPDATED: {
        actions: [
          'updatePosition',
          'updateAutoBuyPosition',
          'updateAutoBuyDefaults',
          'updateAutoSellPosition',
          'updateAutoSellDefaults',
        ],
      },
      SIGNER_UPDATED: {
        actions: ['updateSigner', 'sendSignerToAutoBuy', 'sendSignerToAutoSell'],
      },
      TRANSACTION_DONE: {
        target: 'loading',
      },
    },
  },
  {
    guards: {},
    actions: {
      setAutoBuyView: assign(() => ({
        optimizationCurrentView: 'auto-buy' as const,
        showAutoBuyBanner: false,
        showPartialTakeProfitBanner: true,
      })),
      setPartialTakeProfitView: assign(() => ({
        optimizationCurrentView: 'partial-take-profit' as const,
        showAutoBuyBanner: true,
        showPartialTakeProfitBanner: false,
      })),
      changeView: assign((context, { view }) => ({
        protectionCurrentView: view,
      })),
      resetProtection: assign(() => ({
        protectionCurrentView: undefined,
      })),
      updatePosition: assign((context, event) => ({
        position: event.position,
      })),
      updateAutoBuyPosition: sendTo(
        (context) => {
          return context.autoBuyTrigger
        },
        (context, event) => ({
          type: 'UPDATE_POSITION_VALUE',
          position: mapPositionToAutoBuyPosition({ ...event, ...context }),
        }),
      ),
      updateAutoSellPosition: sendTo(
        (context) => {
          return context.autoSellTrigger
        },
        (context, event) => ({
          type: 'UPDATE_POSITION_VALUE',
          position: mapPositionToAutoBuyPosition({ ...event, ...context }),
        }),
      ),
      updateTriggers: assign((context, event) => ({
        currentTriggers: event.data,
      })),
      updateCurrentViews: assign((context, event) => {
        const currentOptimizationView = getCurrentOptimizationView(event.data)
        return {
          optimizationCurrentView: getCurrentOptimizationView(event.data),
          protectionCurrentView: getCurrentProtectionView(event.data),
          showAutoBuyBanner:
            context.strategyConfig.isAutomationFeatureEnabled(AutomationFeatures.AUTO_BUY) &&
            currentOptimizationView !== 'auto-buy',
          showPartialTakeProfitBanner:
            context.strategyConfig.isAutomationFeatureEnabled(
              AutomationFeatures.PARTIAL_TAKE_PROFIT,
            ) && currentOptimizationView !== 'partial-take-profit',
        }
      }),
      updateAutoBuyDefaults: sendTo(
        (context) => {
          return context.autoBuyTrigger
        },
        (context, event) => {
          const ltv = Number(event.position.riskRatio.loanToValue.times(100).toFixed(2))
          const maxLtv = Number(event.position.category.maxLoanToValue.times(100).toFixed(2))
          return {
            type: 'UPDATE_DEFAULT_VALUES',
            defaults: {
              executionTriggerLTV: ltv - 5,
              targetTriggerLTV: ltv,
              minSliderValue: 1,
              maxSliderValue: maxLtv,
              maxGasFee: 300,
            },
          }
        },
      ),
      updateAutoSellDefaults: sendTo(
        (context) => {
          return context.autoSellTrigger
        },
        (context, event) => {
          const ltv = Number(event.position.riskRatio.loanToValue.times(100).toFixed(2))
          const maxLtv = Number(event.position.category.maxLoanToValue.times(100).toFixed(2))
          return {
            type: 'UPDATE_DEFAULT_VALUES',
            defaults: {
              executionTriggerLTV: ltv + 5,
              targetTriggerLTV: ltv,
              minSliderValue: 1,
              maxSliderValue: maxLtv,
              maxGasFee: 300,
            },
          }
        },
      ),
      sendAutoBuyTrigger: sendTo(
        (context) => context.autoBuyTrigger,
        (_, event) => {
          return {
            type: 'CURRENT_TRIGGER_RECEIVED',
            currentTrigger:
              event.data.triggers.aave3.basicBuy || event.data.triggers.spark.basicBuy,
          }
        },
      ),
      sendAutoSellTrigger: sendTo(
        (context) => context.autoSellTrigger,
        (_, event) => {
          return {
            type: 'CURRENT_TRIGGER_RECEIVED',
            currentTrigger:
              event.data.triggers.aave3.basicSell || event.data.triggers.spark.basicSell,
          }
        },
      ),
      updateSigner: assign((_, event) => ({
        signer: event.signer,
      })),
      sendSignerToAutoBuy: sendTo(
        (context) => context.autoBuyTrigger,
        (_, event) => {
          return {
            type: 'SIGNER_UPDATED',
            signer: event.signer,
          }
        },
      ),
      sendSignerToAutoSell: sendTo(
        (context) => context.autoSellTrigger,
        (_, event) => {
          return {
            type: 'SIGNER_UPDATED',
            signer: event.signer,
          }
        },
      ),
    },
    services: {
      getTriggers: async (context): Promise<GetTriggersResponse> => {
        const {
          dpm,
          strategyConfig: { networkId, protocol },
        } = context

        if (!dpm) {
          return omniPositionTriggersDataDefault()
        }

        return await getTriggersRequest({ dpmProxy: dpm.proxy, networkId, protocol })
      },
    },
  },
)
