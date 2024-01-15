import { mapSimulationValidation } from 'features/omni-kit/components'
import type {
  OmniPartialValidations,
  OmniSimulationCommon,
  OmniValidationItem,
} from 'features/omni-kit/types'

export const mapOmniValidations = ({
  localErrors,
  localWarnings,
  localNotices,
  localSuccesses,
  commonValidations,
  lendingValidations,
  simulationErrors,
  simulationWarnings,
  simulationNotices,
  simulationSuccesses,
  collateralToken,
  quoteToken,
  token,
}: {
  localErrors: OmniValidationItem[]
  localWarnings: OmniValidationItem[]
  localNotices: OmniValidationItem[]
  localSuccesses: OmniValidationItem[]
  commonValidations: OmniPartialValidations
  lendingValidations: OmniPartialValidations
  simulationErrors: OmniSimulationCommon['errors']
  simulationWarnings: OmniSimulationCommon['warnings']
  simulationNotices: OmniSimulationCommon['notices']
  simulationSuccesses: OmniSimulationCommon['successes']
  collateralToken: string
  quoteToken: string
  token: string
}) => ({
  errors: [
    ...localErrors,
    ...commonValidations.localErrors,
    ...lendingValidations.localErrors,
    ...mapSimulationValidation({ items: simulationErrors, collateralToken, quoteToken, token }),
  ],

  warnings: [
    ...localWarnings,
    ...commonValidations.localWarnings,
    ...lendingValidations.localWarnings,
    ...mapSimulationValidation({ items: simulationWarnings, collateralToken, quoteToken, token }),
  ],
  notices: [
    ...localNotices,
    ...mapSimulationValidation({ items: simulationNotices, collateralToken, quoteToken, token }),
  ],
  successes: [
    ...localSuccesses,
    ...mapSimulationValidation({ items: simulationSuccesses, collateralToken, quoteToken, token }),
  ],
})
