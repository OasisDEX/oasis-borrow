import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import type { TriggersAaveEvent, triggersAaveStateMachine } from 'features/aave/manage/state'
import { AutomationFeatures } from 'features/automation/common/types'
import { useTranslation } from 'next-i18next'
import { useMemo } from 'react'
import { circle_exchange } from 'theme/icons'
import type { Sender, StateFrom } from 'xstate'

export function useOptimizationSidebarDropdown(
  state: StateFrom<typeof triggersAaveStateMachine>,
  sender: Sender<TriggersAaveEvent>,
): SidebarSectionHeaderDropdown {
  const { t } = useTranslation()

  const hasAaveAutoBuyEnabled = state.context.currentTriggers.triggers.aaveBasicBuy !== undefined
  const hasSparkAutoBuyEnabled = state.context.currentTriggers.triggers.sparkBasicBuy !== undefined

  const hasAavePartialTakeProfitEnabled =
    state.context.currentTriggers.triggers.aavePartialTakeProfit !== undefined
  const hasSparkPartialTakeProfitEnabled =
    state.context.currentTriggers.triggers.sparkPartialTakeProfit !== undefined

  const currentPanel = useMemo(() => {
    return {
      'auto-buy': AutomationFeatures.AUTO_BUY,
      'partial-take-profit': AutomationFeatures.PARTIAL_TAKE_PROFIT,
    }[state.context.optimizationCurrentView || 'partial-take-profit']
  }, [state.context.optimizationCurrentView])

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
      {
        label: `${
          hasAavePartialTakeProfitEnabled || hasSparkPartialTakeProfitEnabled ? 'Manage' : 'Set up'
        } ${t('system.take-profit')}`,
        shortLabel: t('system.take-profit'),
        iconShrink: 2,
        icon: circle_exchange,
        panel: AutomationFeatures.PARTIAL_TAKE_PROFIT,
        action: () => {
          sender({ type: 'SHOW_PARTIAL_TAKE_PROFIT' })
        },
      },
    ],
  }
}
