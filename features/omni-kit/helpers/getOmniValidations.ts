import { mapSimulationValidation } from 'features/omni-kit/components'
import {
  getOmniCommonValidations,
  getOmniLendingValidations,
  isOmniFormValid,
} from 'features/omni-kit/helpers'
import type {
  GetOmniValidationResolverParams,
  GetOmniValidationsParams,
  OmniValidations,
} from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

export const getOmniValidations =
  ({
    collateralBalance,
    collateralToken,
    currentStep,
    ethBalance,
    ethPrice,
    gasEstimationUsd,
    isOpening,
    position,
    productType,
    quoteBalance,
    quoteToken,
    simulationErrors = [],
    simulationNotices = [],
    simulationSuccesses = [],
    simulationWarnings = [],
    state,
    txError,
  }: GetOmniValidationsParams) =>
  ({
    safetySwitchOn,
    isFormFrozen,
    customErrors = [],
    customWarnings = [],
    customNotices = [],
    customSuccesses = [],
    earnIsFormValid = false,
    protocolLabel,
  }: GetOmniValidationResolverParams): OmniValidations => {
    const isEarnProduct = productType === OmniProductType.Earn
    const token = isEarnProduct ? quoteToken : collateralToken

    const commonValidations = getOmniCommonValidations({
      collateralToken,
      quoteToken,
      state,
      txError,
      productType,
      ethBalance,
      collateralBalance,
      quoteBalance,
      ethPrice,
      gasEstimationUsd,
    })

    const lendingValidations = getOmniLendingValidations({
      safetySwitchOn,
      isOpening,
      position,
      state,
      quoteBalance,
      protocolLabel,
    })

    const errors = [
      ...customErrors,
      ...commonValidations.localErrors,
      ...lendingValidations.localErrors,
      ...mapSimulationValidation({ items: simulationErrors, collateralToken, quoteToken, token }),
    ]

    const warnings = [
      ...customWarnings,
      ...commonValidations.localWarnings,
      ...lendingValidations.localWarnings,
      ...mapSimulationValidation({ items: simulationWarnings, collateralToken, quoteToken, token }),
    ]
    const notices = [
      ...customNotices,
      ...mapSimulationValidation({ items: simulationNotices, collateralToken, quoteToken, token }),
    ]
    const successes = [
      ...customSuccesses,
      ...mapSimulationValidation({
        items: simulationSuccesses,
        collateralToken,
        quoteToken,
        token,
      }),
    ]

    return {
      isFormValid: isOmniFormValid({ currentStep, productType, state, earnIsFormValid }),
      hasErrors: errors.length > 0,
      isFormFrozen,
      errors,
      warnings: errors.length > 0 ? [] : warnings,
      notices,
      successes,
    }
  }
