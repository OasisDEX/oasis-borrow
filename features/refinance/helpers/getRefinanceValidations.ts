import type { OmniValidationItem, OmniValidations } from 'features/omni-kit/types'
import type { RefinanceFormState } from 'features/refinance/state/refinanceFormReducto.types'

export const getRefinanceValidations = ({
  state,
}: {
  state: RefinanceFormState
}): OmniValidations => {
  const warnings: OmniValidationItem[] = []

  if (state.hasSimilarPosition) {
    warnings.push({ message: { translationKey: 'similar-position' } })
  }

  return {
    errors: [],
    hasErrors: false,
    isFormFrozen: false,
    isFormValid: true,
    notices: [],
    successes: [],
    warnings,
  }
}
