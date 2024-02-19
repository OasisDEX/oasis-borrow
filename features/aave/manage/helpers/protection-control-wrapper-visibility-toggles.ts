import type { triggersAaveStateMachine } from 'features/aave/manage/state'
import {
  hasActiveAutoSell,
  hasActiveStopLoss,
  hasActiveTrailingStopLoss,
  isAutoSellEnabled,
} from 'features/aave/manage/state'
import { AutomationFeatures } from 'features/automation/common/types'
import type { StateFrom } from 'xstate'

export const getProtectionControlVisibilityToggles = (
  triggersState: StateFrom<typeof triggersAaveStateMachine>,
) => {
  const { protectionCurrentView, strategyConfig } = triggersState.context
  // this set the proper visibility of the protection control elements:
  // details (and which should come first [the ones youre setting up])
  // sidebar (active viewing/editing)
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
    // banners
    ...banners,
    // active/configuring (managing or setting up)
    autoSellConfiguring: protectionCurrentView === 'auto-sell',
    stopLossConfiguring: protectionCurrentView === 'stop-loss',
    trailingStopLossConfiguring: protectionCurrentView === 'trailing-stop-loss',
    // viewing (below the active one)
    autoSellViewing: hasAutoSell && protectionCurrentView !== 'auto-sell',
    stopLossViewing: hasStopLoss && protectionCurrentView !== 'stop-loss',
    trailingStopLossViewing: hasTrailingStopLoss && protectionCurrentView !== 'trailing-stop-loss',
    // proper sidebar
    autoSellSidebar: showAutoSell && protectionCurrentView === 'auto-sell',
    stopLossSidebar: protectionCurrentView === 'stop-loss',
    trailingStopLossSidebar: protectionCurrentView === 'trailing-stop-loss',
  }
}
