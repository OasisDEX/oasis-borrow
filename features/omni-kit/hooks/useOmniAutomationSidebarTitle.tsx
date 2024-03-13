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
      automationForm: { state },
    },
  } = useOmniProductContext(productType)

  const [hash] = useHash()

  const translationKeyMap = {
    protection: {
      [AutomationFeatures.TRAILING_STOP_LOSS]: t('system.trailing-stop-loss'),
      [AutomationFeatures.STOP_LOSS]: t('system.stop-loss'),
      [AutomationFeatures.AUTO_SELL]: t('auto-sell.title'),
    },
    optimization: {
      [AutomationFeatures.PARTIAL_TAKE_PROFIT]: t('system.partial-take-profit'),
      [AutomationFeatures.AUTO_BUY]: t('auto-buy.title'),
      [AutomationFeatures.CONSTANT_MULTIPLE]: t('system.constant-multiple'),
      [AutomationFeatures.AUTO_TAKE_PROFIT]: t('system.auto-take-profit'),
    },
  }[hash]

  const uiDropdown = {
    protection: state.uiDropdownProtection,
    optimization: state.uiDropdownOptimization,
  }[hash]

  return t(`omni-kit.form.automation-title.${currentStep}`, {
    automationFeature:
      uiDropdown && translationKeyMap ? translationKeyMap[uiDropdown] : 'automation',
  })
}
