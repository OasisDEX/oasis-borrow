import { isOmniFormValid } from 'features/omni-kit/helpers/isOmniFormValid'
import type {
  OmniFormState,
  OmniProductType,
  OmniSidebarStep,
  OmniValidationItem,
} from 'features/omni-kit/types'

export const resolveOmniValidations = ({
  currentStep,
  productType,
  state,
  earnIsFormValid,
  isFormFrozen,
  errors,
  warnings,
  notices,
  successes,
}: {
  currentStep: OmniSidebarStep
  productType: OmniProductType
  state: OmniFormState
  earnIsFormValid: boolean
  isFormFrozen: boolean
  errors: OmniValidationItem[]
  warnings: OmniValidationItem[]
  notices: OmniValidationItem[]
  successes: OmniValidationItem[]
}) => ({
  isFormValid: isOmniFormValid({ currentStep, productType, state, earnIsFormValid }),
  hasErrors: errors.length > 0,
  isFormFrozen,
  errors,
  warnings: errors.length > 0 ? [] : warnings,
  notices,
  successes,
})
