import { AutomationFeatures } from 'features/automation/common/types'
import { isOmniAutomationFormEmpty } from 'features/omni-kit/automation/helpers'
import type { OmniAutomationFormState } from 'features/omni-kit/state/automation/common'
import type { ProductContextAutomationForms } from 'features/omni-kit/types'

interface GetAutomationMetadataValuesParams {
  commonFormState: OmniAutomationFormState
  automationForms: ProductContextAutomationForms
  hash: string
}

export const getAutomationMetadataValues = ({
  commonFormState,
  automationForms,
  hash,
}: GetAutomationMetadataValuesParams) => {
  const isProtection = hash === 'protection'
  const isOptimization = hash === 'optimization'

  const activeUiDropdown = isProtection
    ? commonFormState.uiDropdownProtection || AutomationFeatures.TRAILING_STOP_LOSS
    : commonFormState.uiDropdownOptimization || AutomationFeatures.PARTIAL_TAKE_PROFIT

  const activeForm = automationForms[activeUiDropdown as `${AutomationFeatures}`]
  const isFormEmpty = isOmniAutomationFormEmpty(activeForm.state, activeUiDropdown)

  return {
    resolved: {
      activeUiDropdown,
      activeForm,
      isProtection,
      isOptimization,
      isFormEmpty,
    },
  }
}
