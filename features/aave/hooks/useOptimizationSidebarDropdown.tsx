import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import type { TriggersAaveEvent, triggersAaveStateMachine } from 'features/aave/manage/state'
import { AutomationFeatures } from 'features/automation/common/types'
import { useTranslation } from 'next-i18next'
import { circle_exchange } from 'theme/icons'
import type { Sender, StateFrom } from 'xstate'

export function useOptimizationSidebarDropdown(
  state: StateFrom<typeof triggersAaveStateMachine>,
  sender: Sender<TriggersAaveEvent>,
): SidebarSectionHeaderDropdown {
  const { t } = useTranslation()

  const hasAaveAutoBuyEnabled = state.context.currentTriggers.triggers.aaveBasicBuy !== undefined
  const hasSparkAutoBuyEnabled = state.context.currentTriggers.triggers.sparkBasicBuy !== undefined

  const currentPanel =
    state.context.protectionCurrentView === 'auto-sell'
      ? AutomationFeatures.AUTO_SELL
      : AutomationFeatures.STOP_LOSS

  return {
    forcePanel: currentPanel,
    items: [
      {
        label: `${hasAaveAutoBuyEnabled || hasSparkAutoBuyEnabled ? 'Manage' : 'Set up'} ${t(
          'system.basic-buy',
        )}`,
        shortLabel: t('system.basic-buy'),
        iconShrink: 2,
        icon: circle_exchange,
        panel: AutomationFeatures.AUTO_BUY,
        action: () => {
          sender({ type: 'SHOW_AUTO_BUY' })
        },
      },
    ],
  }
}
