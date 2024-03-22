import { omniAutomationTranslationKeyMap } from 'features/omni-kit/automation/constants'
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

  const uiDropdown = {
    protection: state.uiDropdownProtection,
    optimization: state.uiDropdownOptimization,
  }[hash]

  const resolvedUiDropdown = state.activeTxUiDropdown || uiDropdown

  return t(`omni-kit.form.automation-title.${currentStep}`, {
    automationFeature: resolvedUiDropdown
      ? t(omniAutomationTranslationKeyMap[resolvedUiDropdown])
      : 'automation',
  })
}
