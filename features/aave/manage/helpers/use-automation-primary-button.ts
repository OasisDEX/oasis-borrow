import type { SidebarSectionFooterButtonSettings } from 'components/sidebar/SidebarSectionFooter'
import type { AutoBuySidebarAaveVaultProps } from 'features/aave/manage/sidebars/AutoBuySidebarAaveVault'
import type { AutoSellSidebarAaveVaultProps } from 'features/aave/manage/sidebars/AutoSellSidebarAaveVault'
import { sidebarAutomationFeatureCopyMap } from 'features/automation/common/consts'
import { TriggerAction } from 'helpers/triggers/setup-triggers'
import { useTranslation } from 'next-i18next'

export function useAutomationPrimaryButton(
  props: AutoBuySidebarAaveVaultProps | AutoSellSidebarAaveVaultProps,
): SidebarSectionFooterButtonSettings {
  const { isStateMatch, canTransitWith } = props
  const { t } = useTranslation()
  const editingLabel =
    props.state.action === TriggerAction.Add
      ? t('automation.add-trigger', {
          feature: t(sidebarAutomationFeatureCopyMap[props.state.feature]),
        })
      : t('automation.update-trigger', {
          feature: t(sidebarAutomationFeatureCopyMap[props.state.feature]),
        })

  switch (true) {
    case isStateMatch('idle'):
      return {
        isLoading: props.state.isLoading,
        action: () => {},
        disabled: true,
        label: editingLabel,
        steps: [1, 3],
      }
    case isStateMatch('editing'):
      return {
        isLoading: props.state.isLoading,
        action: () => {
          props.updateState({ type: 'REVIEW_TRANSACTION' })
        },
        disabled: !canTransitWith({ type: 'REVIEW_TRANSACTION' }),
        label: editingLabel,
        steps: [1, 3],
      }
    case isStateMatch('review'):
      return {
        isLoading: props.state.isLoading,
        action: () => {
          props.updateState({ type: 'START_TRANSACTION' })
        },
        disabled: !canTransitWith({ type: 'START_TRANSACTION' }),
        label: props.state.retryCount > 0 ? t('retry') : t('protection.confirm'),
        steps: [2, 3],
      }
    case isStateMatch('remove'):
      return {
        isLoading: props.state.isLoading,
        action: () => {
          props.updateState({ type: 'START_TRANSACTION' })
        },
        disabled: !canTransitWith({ type: 'START_TRANSACTION' }),
        label:
          props.state.retryCount > 0
            ? t('retry')
            : t('automation.cancel-trigger', {
                feature: t(sidebarAutomationFeatureCopyMap[props.state.feature]),
              }),
      }
    case isStateMatch('tx'):
      return {
        isLoading: props.state.isLoading,
        action: () => {},
        disabled: true,
        label: t('automation.setting', {
          feature: t(sidebarAutomationFeatureCopyMap[props.state.feature]),
        }),
        steps: [3, 3],
      }
    case isStateMatch('txDone'):
      return {
        isLoading: props.state.isLoading,
        action: () => {
          props.updateState({ type: 'RESET' })
        },
        disabled: false,
        label: t('finished'),
      }
  }
  return {
    isLoading: props.state.isLoading,
    action: () => {},
    disabled: true,
    label: '',
  }
}
