import type { AaveLikePosition } from '@oasisdex/dma-library'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { amountFromWei } from 'blockchain/utils'
import type { ethers } from 'ethers'
import type { IStrategyConfig } from 'features/aave/types'
import { AutomationFeatures } from 'features/automation/common/types'
import type { GetTriggersResponse } from 'helpers/triggers'
import { getTriggersRequest } from 'helpers/triggers'
import type { ActorRefFrom, StateFrom } from 'xstate'
import { actions, createMachine } from 'xstate'

import type {
  autoBuyTriggerAaveStateMachine,
  autoSellTriggerAaveStateMachine,
} from './getBasicAutomationAaveStateMachine'
import type { PositionLike } from './triggersCommon'

const { assign, sendTo } = actions

export type TriggersAaveEvent =
  | { type: 'SHOW_AUTO_BUY' }
  | { type: 'SHOW_AUTO_SELL' }
  | { type: 'SHOW_STOP_LOSS' }
  | { type: 'RESET_PROTECTION' }
  | { type: 'POSITION_UPDATED'; position: AaveLikePosition }
  | { type: 'TRIGGERS_UPDATED'; currentTriggers: GetTriggersResponse }
  | { type: 'SIGNER_UPDATED'; signer?: ethers.Signer }

export const isOptimizationEnabled = ({
  context,
}: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  return (
    context.strategyConfig.isAutomationFeatureEnabled(AutomationFeatures.AUTO_BUY) &&
    context.dpm !== undefined
  )
}

export const isAutoSellEnabled = ({
  context,
}: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  return (
    context.strategyConfig.isAutomationFeatureEnabled(AutomationFeatures.AUTO_SELL) &&
    context.dpm !== undefined
  )
}

export const areTriggersLoading = (state: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  return state.matches('loading')
}

export const hasActiveOptimization = ({
  context,
}: StateFrom<typeof triggersAaveStateMachine>): boolean => {
  return context.currentTriggers.triggers.aaveBasicBuy !== undefined
}

export type TriggersAaveContext = {
  readonly strategyConfig: IStrategyConfig
  readonly dpm?: UserDpmAccount
  position?: AaveLikePosition
  optimizationCurrentView?: 'auto-buy' | undefined
  protectionCurrentView?: 'auto-sell' | 'stop-loss' | undefined
  showAutoBuyBanner: boolean
  showAutoSellBanner: boolean
  currentTriggers: GetTriggersResponse
  signer?: ethers.Signer
  autoBuyTrigger: ActorRefFrom<typeof autoBuyTriggerAaveStateMachine>
  autoSellTrigger: ActorRefFrom<typeof autoSellTriggerAaveStateMachine>
}

function mapPositionToAutoBuyPosition({
  position,
  dpm,
}: {
  position: AaveLikePosition
  dpm?: UserDpmAccount
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
          SHOW_AUTO_SELL: {
            actions: ['setAutoSellView'],
          },
          RESET_PROTECTION: {
            actions: ['resetProtection'],
          },
          SHOW_STOP_LOSS: {
            actions: ['setStopLossView'],
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
              actions: ['updateTriggers', 'sendAutoBuyTrigger', 'sendAutoSellTrigger'],
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
    },
  },
  {
    guards: {},
    actions: {
      setAutoBuyView: assign(() => ({
        optimizationCurrentView: 'auto-buy' as const,
        showAutoBuyBanner: false,
      })),
      setAutoSellView: assign(() => ({
        protectionCurrentView: 'auto-sell' as const,
        showAutoSellBanner: false,
      })),
      setStopLossView: assign(() => ({
        protectionCurrentView: 'stop-loss' as const,
        showAutoSellBanner: true,
      })),
      resetProtection: assign(() => ({
        protectionCurrentView: undefined,
        showAutoSellBanner: true,
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
