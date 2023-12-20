import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
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

  return {
    items: [
      {
        label: `${hasStopLossEnabled ? 'Manage' : 'Setup'} ${t('system.stop-loss')}`,
        shortLabel: t('system.stop-loss'),
        iconShrink: 2,
        icon: circle_exchange,
        panel: AutomationFeatures.STOP_LOSS,
        action: () => {
          sender({ type: 'SHOW_STOP_LOSS' })
        },
      },
      {
        label: `${hasAutoSellEnabled ? 'Manage' : 'Setup'} ${t('system.basic-sell')}`,
        shortLabel: t('system.basic-sell'),
        iconShrink: 2,
        icon: circle_exchange,
        panel: AutomationFeatures.AUTO_SELL,
        action: () => {
          sender({ type: 'SHOW_AUTO_SELL' })
        },
      },
    ],
  }
}
