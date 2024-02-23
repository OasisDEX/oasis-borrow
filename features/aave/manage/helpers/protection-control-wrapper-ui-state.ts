import type { triggersAaveStateMachine } from 'features/aave/manage/state'
import {
  hasActiveAutoSell,
  hasActiveStopLoss,
  hasActiveTrailingStopLoss,
  isAutoSellEnabled,
} from 'features/aave/manage/state'
import { AutomationFeatures } from 'features/automation/common/types'
import type { StateFrom } from 'xstate'

export const getProtectionControlUIstate = (
  triggersState: StateFrom<typeof triggersAaveStateMachine>,
) => {
  const { protectionCurrentView, strategyConfig } = triggersState.context
  // this set the proper visibility of the protection control elements:
  // view - viewing the existing trigger data
  // configure - editing the existing trigger data (or creating a new one) is always at the top
  // sidebar (active when viewing/editing)
  // banners
  const showAutoSell = isAutoSellEnabled(triggersState)
  const hasStopLoss = hasActiveStopLoss(triggersState)
  const hasTrailingStopLoss = hasActiveTrailingStopLoss(triggersState)
  const hasAutoSell = hasActiveAutoSell(triggersState)
  const banners = {
    bannerStopLoss:
      !hasStopLoss &&
      protectionCurrentView !== 'stop-loss' &&
      strategyConfig.isAutomationFeatureEnabled(AutomationFeatures.STOP_LOSS),
    bannerTrailingStopLoss:
      !hasTrailingStopLoss &&
      protectionCurrentView !== 'trailing-stop-loss' &&
      strategyConfig.isAutomationFeatureEnabled(AutomationFeatures.TRAILING_STOP_LOSS),
    bannerAutoSell:
      !hasAutoSell &&
      protectionCurrentView !== 'auto-sell' &&
      strategyConfig.isAutomationFeatureEnabled(AutomationFeatures.AUTO_SELL),
  }
  return {
    autoSell: {
      view: hasAutoSell && protectionCurrentView !== 'auto-sell',
      configure: protectionCurrentView === 'auto-sell',
      sidebar: showAutoSell && protectionCurrentView === 'auto-sell',
      banner: banners.bannerAutoSell,
    },
    stopLoss: {
      view: hasStopLoss && protectionCurrentView !== 'stop-loss',
      configure: protectionCurrentView === 'stop-loss',
      sidebar: protectionCurrentView === 'stop-loss',
      banner: banners.bannerStopLoss,
    },
    trailingStopLoss: {
      view: hasTrailingStopLoss && protectionCurrentView !== 'trailing-stop-loss',
      configure: protectionCurrentView === 'trailing-stop-loss',
      sidebar: protectionCurrentView === 'trailing-stop-loss',
      banner: banners.bannerTrailingStopLoss,
    },
  }
}
