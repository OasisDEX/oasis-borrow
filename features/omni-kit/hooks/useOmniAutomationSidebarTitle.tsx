import { AutomationFeatures } from 'features/automation/common/types'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'

export const useOmniAutomationSidebarTitle = () => {
  const { t } = useTranslation()

  const {
    environment: { productType },
    automationSteps: { currentStep },
  } = useOmniGeneralContext()

  const {
    automation: {
      commonForm: { state },
    },
  } = useOmniProductContext(productType)

  const [hash] = useHash()

  const translationKeyMap = {
    [AutomationFeatures.TRAILING_STOP_LOSS]: t('system.trailing-stop-loss'),
    [AutomationFeatures.STOP_LOSS]: t('system.stop-loss'),
    [AutomationFeatures.AUTO_SELL]: t('auto-sell.title'),
    [AutomationFeatures.PARTIAL_TAKE_PROFIT]: t('system.partial-take-profit'),
    [AutomationFeatures.AUTO_BUY]: t('auto-buy.title'),
    [AutomationFeatures.CONSTANT_MULTIPLE]: t('system.constant-multiple'),
    [AutomationFeatures.AUTO_TAKE_PROFIT]: t('system.auto-take-profit'),
  }

  const uiDropdown = {
    protection: state.uiDropdownProtection,
    optimization: state.uiDropdownOptimization,
  }[hash]

  const resolvedUiDropdown = state.activeTxUiDropdown || uiDropdown

  return t(`omni-kit.form.automation-title.${currentStep}`, {
    automationFeature:
      resolvedUiDropdown && translationKeyMap
        ? translationKeyMap[resolvedUiDropdown]
        : 'automation',
  })
}
