import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import type { SidebarSectionHeaderSelectItem } from 'components/sidebar/SidebarSectionHeaderSelect'
import {
  hasActiveAutoSell,
  hasActiveStopLoss,
  hasActiveTrailingStopLoss,
  type TriggersAaveEvent,
  type triggersAaveStateMachine,
} from 'features/aave/manage/state'
import { AutomationFeatures } from 'features/automation/common/types'
import { useTranslation } from 'next-i18next'
import { circle_exchange } from 'theme/icons'
import type { Sender, StateFrom } from 'xstate'

export function useProtectionSidebarDropdown(
  state: StateFrom<typeof triggersAaveStateMachine>,
  sender: Sender<TriggersAaveEvent>,
): SidebarSectionHeaderDropdown {
  const { t } = useTranslation()

  const { context } = state
  const isStopLossEnabledForStrategy = context.strategyConfig.isAutomationFeatureEnabled(
    AutomationFeatures.STOP_LOSS,
  )
  const isAutoSellEnabledForStrategy = context.strategyConfig.isAutomationFeatureEnabled(
    AutomationFeatures.AUTO_SELL,
  )
  const isTrailingStopLossEnabledForStrategy = context.strategyConfig.isAutomationFeatureEnabled(
    AutomationFeatures.TRAILING_STOP_LOSS,
  )
  const hasTrailingStopLoss = hasActiveTrailingStopLoss(state)
  const hasStopLoss = hasActiveStopLoss(state)

  let items: SidebarSectionHeaderSelectItem[] = []
  const getStopLossView = () => {
    if (hasTrailingStopLoss) {
      return 'trailing-stop-loss'
    }
    if (isTrailingStopLossEnabledForStrategy) {
      return 'stop-loss-selector'
    }
    return 'stop-loss'
  }
  if (isStopLossEnabledForStrategy) {
    items.push({
      label: `${hasStopLoss || hasTrailingStopLoss ? 'Manage' : 'Setup'} ${t('system.stop-loss')}`,
      shortLabel: t('system.stop-loss'),
      iconShrink: 2,
      icon: circle_exchange,
      panel: AutomationFeatures.STOP_LOSS,
      action: () => {
        sender({
          type: 'CHANGE_VIEW',
          view: getStopLossView(),
        })
      },
    })
  }
  if (isAutoSellEnabledForStrategy) {
    items.push({
      label: `${hasActiveAutoSell(state) ? 'Manage' : 'Setup'} ${t('system.basic-sell')}`,
      shortLabel: t('system.basic-sell'),
      iconShrink: 2,
      icon: circle_exchange,
      panel: AutomationFeatures.AUTO_SELL,
      action: () => {
        sender({ type: 'CHANGE_VIEW', view: 'auto-sell' })
      },
    })
  }

  if (context.protectionCurrentView === 'auto-sell') {
    items = items.reverse()
  }
  return {
    items: [...items],
  }
}
