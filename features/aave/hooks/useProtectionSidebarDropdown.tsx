import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import type { SidebarSectionHeaderSelectItem } from 'components/sidebar/SidebarSectionHeaderSelect'
import type { TriggersAaveEvent, triggersAaveStateMachine } from 'features/aave/manage/state'
import { AutomationFeatures } from 'features/automation/common/types'
import { useTranslation } from 'next-i18next'
import { circle_exchange } from 'theme/icons'
import type { Sender, StateFrom } from 'xstate'

export function useProtectionSidebarDropdown(
  state: StateFrom<typeof triggersAaveStateMachine>,
  sender: Sender<TriggersAaveEvent>,
): SidebarSectionHeaderDropdown {
  const { t } = useTranslation()

  const hasAutoSellEnabled = state.context.currentTriggers.triggers.aaveBasicSell !== undefined
  const hasStopLossEnabled =
    state.context.currentTriggers.triggers.aaveStopLossToDebt !== undefined &&
    state.context.currentTriggers.triggers.aaveStopLossToCollateral !== undefined

  const isStopLossEnabledForStrategy = state.context.strategyConfig.isAutomationFeatureEnabled(
    AutomationFeatures.STOP_LOSS,
  )
  const isAutoSellEnabledForStrategy = state.context.strategyConfig.isAutomationFeatureEnabled(
    AutomationFeatures.AUTO_SELL,
  )

  let items: SidebarSectionHeaderSelectItem[] = []
  if (isStopLossEnabledForStrategy) {
    items.push({
      label: `${hasStopLossEnabled ? 'Manage' : 'Setup'} ${t('system.stop-loss')}`,
      shortLabel: t('system.stop-loss'),
      iconShrink: 2,
      icon: circle_exchange,
      panel: AutomationFeatures.STOP_LOSS,
      action: () => {
        sender({ type: 'SHOW_STOP_LOSS' })
      },
    })
  }
  if (isAutoSellEnabledForStrategy) {
    items.push({
      label: `${hasAutoSellEnabled ? 'Manage' : 'Setup'} ${t('system.basic-sell')}`,
      shortLabel: t('system.basic-sell'),
      iconShrink: 2,
      icon: circle_exchange,
      panel: AutomationFeatures.AUTO_SELL,
      action: () => {
        sender({ type: 'SHOW_AUTO_SELL' })
      },
    })
  }

  if (state.context.protectionCurrentView === 'auto-sell') {
    items = items.reverse()
  }
  return {
    items: [...items],
  }
}
