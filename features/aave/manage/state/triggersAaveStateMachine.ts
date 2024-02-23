import type { AaveLikePosition } from '@oasisdex/dma-library'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { amountFromWei } from 'blockchain/utils'
import type { ethers } from 'ethers'
import type { IStrategyConfig } from 'features/aave/types'
import { StrategyType } from 'features/aave/types'
import { AutomationFeatures } from 'features/automation/common/types'
import { isAnyValueDefined } from 'helpers/isAnyValueDefined'
import type { GetTriggersResponse } from 'helpers/triggers'
import { getTriggersRequest } from 'helpers/triggers'
import { LendingProtocol } from 'lendingProtocols'
import type { ActorRefFrom, StateFrom } from 'xstate'
import { actions, createMachine } from 'xstate'

import type {
  autoBuyTriggerAaveStateMachine,
  autoSellTriggerAaveStateMachine,
} from './getBasicAutomationAaveStateMachine'
import type { PositionLike } from './triggersCommon'

const { assign, sendTo } = actions

export type TriggersViews =
  | 'auto-buy'
  | 'auto-sell'
  | 'stop-loss-selector'
  | 'stop-loss'
  | 'trailing-stop-loss'

export type TriggersAaveEvent =
  | { type: 'CHANGE_VIEW'; view: TriggersViews }
  | { type: 'SHOW_AUTO_BUY' }
  | { type: 'SHOW_STOP_LOSS' }
  | { type: 'RESET_PROTECTION' }
  | { type: 'POSITION_UPDATED'; position: AaveLikePosition }
  | { type: 'TRIGGERS_UPDATED'; currentTriggers: GetTriggersResponse }
  | { type: 'SIGNER_UPDATED'; signer?: ethers.Signer }
  | { type: 'TRANSACTION_DONE' }

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
}: GetTriggersResponse): 'auto-buy' | undefined => {
  if (triggers.aaveBasicBuy) {
    return 'auto-buy'
  }
  return undefined
}

export const getCurrentProtectionView = ({
  triggers,
}: GetTriggersResponse): 'auto-sell' | 'stop-loss' | 'trailing-stop-loss' | undefined => {
  if (
    triggers.aaveStopLossToDebt ||
    triggers.aaveStopLossToCollateral ||
    triggers.aaveStopLossToCollateralDMA ||
    triggers.aaveStopLossToDebtDMA ||
    triggers.sparkStopLossToDebt ||
    triggers.sparkStopLossToCollateral ||
    triggers.sparkStopLossToCollateralDMA ||
    triggers.sparkStopLossToDebtDMA
  ) {
    return 'stop-loss'
  }

  if (triggers.aaveBasicSell) {
    return 'auto-sell'
  }

  if (triggers.aaveTrailingStopLossDMA) {
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
  return context.currentTriggers.triggers.aaveBasicBuy !== undefined
}

export const hasActiveProtection = ({
  context,
}: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  const protocol = context.strategyConfig.protocol
  const {
    aaveStopLossToCollateral,
    sparkStopLossToCollateral,
    aaveStopLossToCollateralDMA,
    aaveStopLossToDebtDMA,
    sparkStopLossToCollateralDMA,
    sparkStopLossToDebtDMA,
    sparkStopLossToDebt,
    aaveStopLossToDebt,
    aaveBasicSell,
    aaveTrailingStopLossDMA,
  } = context.currentTriggers.triggers
  switch (protocol) {
    case LendingProtocol.AaveV3:
      return isAnyValueDefined(
        aaveStopLossToCollateral,
        aaveStopLossToDebt,
        aaveBasicSell,
        aaveStopLossToCollateralDMA,
        aaveStopLossToDebtDMA,
        aaveTrailingStopLossDMA,
      )
    case LendingProtocol.SparkV3:
      return isAnyValueDefined(
        sparkStopLossToCollateral,
        sparkStopLossToDebt,
        sparkStopLossToCollateralDMA,
        sparkStopLossToDebtDMA,
      )
    case LendingProtocol.AaveV2:
      return false
  }
}

export const hasActiveStopLoss = ({
  context,
}: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  const protocol = context.strategyConfig.protocol
  const {
    aaveStopLossToCollateral,
    sparkStopLossToCollateral,
    aaveStopLossToCollateralDMA,
    aaveStopLossToDebtDMA,
    sparkStopLossToCollateralDMA,
    sparkStopLossToDebtDMA,
    sparkStopLossToDebt,
    aaveStopLossToDebt,
  } = context.currentTriggers.triggers
  switch (protocol) {
    case LendingProtocol.AaveV3:
      return isAnyValueDefined(
        aaveStopLossToCollateral,
        aaveStopLossToDebt,
        aaveStopLossToCollateralDMA,
        aaveStopLossToDebtDMA,
      )
    case LendingProtocol.SparkV3:
      return isAnyValueDefined(
        sparkStopLossToCollateral,
        sparkStopLossToDebt,
        sparkStopLossToCollateralDMA,
        sparkStopLossToDebtDMA,
      )
    case LendingProtocol.AaveV2:
      return false
  }
}

export const hasActiveTrailingStopLoss = ({
  context,
}: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  const protocol = context.strategyConfig.protocol
  const { aaveTrailingStopLossDMA } = context.currentTriggers.triggers
  switch (protocol) {
    case LendingProtocol.AaveV3:
      return isAnyValueDefined(aaveTrailingStopLossDMA)
    case LendingProtocol.SparkV3:
      return false
    case LendingProtocol.AaveV2:
      return false
  }
}

export const hasActiveAutoSell = ({
  context,
}: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  const protocol = context.strategyConfig.protocol
  const { aaveBasicSell } = context.currentTriggers.triggers
  switch (protocol) {
    case LendingProtocol.AaveV3:
      return isAnyValueDefined(aaveBasicSell)
    case LendingProtocol.SparkV3:
      return false
    case LendingProtocol.AaveV2:
      return false
  }
}

export type TriggersAaveContext = {
  readonly strategyConfig: IStrategyConfig
  readonly dpm?: UserDpmAccount
  position?: AaveLikePosition
  optimizationCurrentView?: 'auto-buy' | undefined
  showAutoBuyBanner: boolean
  protectionCurrentView?:
    | 'auto-buy'
    | 'auto-sell'
    | 'stop-loss-selector'
    | 'stop-loss'
    | 'trailing-stop-loss'
  currentTriggers: GetTriggersResponse
  signer?: ethers.Signer
  autoBuyTrigger: ActorRefFrom<typeof autoBuyTriggerAaveStateMachine>
  autoSellTrigger: ActorRefFrom<typeof autoSellTriggerAaveStateMachine>
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
          CHANGE_VIEW: {
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
            currentTrigger: event.data.triggers.aaveBasicBuy,
          }
        },
      ),
      sendAutoSellTrigger: sendTo(
        (context) => context.autoSellTrigger,
        (_, event) => {
          return {
            type: 'CURRENT_TRIGGER_RECEIVED',
            currentTrigger: event.data.triggers.aaveBasicSell,
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
        const { dpm, strategyConfig } = context
        if (!dpm) {
          return {
            triggers: {},
          }
        }
        return await getTriggersRequest({ dpm, networkId: strategyConfig.networkId })
      },
    },
  },
)
