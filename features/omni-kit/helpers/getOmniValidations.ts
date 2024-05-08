import { mapSimulationValidation } from 'features/omni-kit/components'
import {
  getOmniCommonValidations,
  isOmniFormValid,
  useOmniLendingValidations,
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
    poolId,
    position,
    positionTriggers,
    productType,
    protocol,
    quoteBalance,
    quoteToken,
    simulation,
    simulationErrors = [],
    simulationNotices = [],
    simulationSuccesses = [],
    simulationWarnings = [],
    state,
    txError,
  }: GetOmniValidationsParams) =>
  ({
    customErrors = [],
    customNotices = [],
    customSuccesses = [],
    customWarnings = [],
    earnIsFormValid = false,
    isFormFrozen,
    protocolLabel,
    safetySwitchOn,
  }: GetOmniValidationResolverParams): OmniValidations => {
    const isEarnProduct = productType === OmniProductType.Earn
    const token = isEarnProduct ? quoteToken : collateralToken

    const commonValidations = getOmniCommonValidations({
      collateralBalance,
      collateralToken,
      ethBalance,
      ethPrice,
      gasEstimationUsd,
      productType,
      quoteBalance,
      quoteToken,
      state,
      txError,
    })

    const lendingValidations = useOmniLendingValidations({
      isOpening,
      poolId,
      position,
      positionTriggers,
      protocolLabel,
      quoteBalance,
      safetySwitchOn,
      simulation,
      state,
    })

    const errors = [
      ...customErrors,
      ...commonValidations.localErrors,
      ...lendingValidations.localErrors,
      ...mapSimulationValidation({
        collateralToken,
        items: simulationErrors,
        productType,
        protocol,
        quoteToken,
        token,
      }),
    ]

    const warnings = [
      ...customWarnings,
      ...commonValidations.localWarnings,
      ...lendingValidations.localWarnings,
      ...mapSimulationValidation({
        collateralToken,
        items: simulationWarnings,
        productType,
        protocol,
        quoteToken,
        token,
      }),
    ]
    const notices = [
      ...customNotices,
      ...mapSimulationValidation({
        collateralToken,
        items: simulationNotices,
        productType,
        protocol,
        quoteToken,
        token,
      }),
    ]
    const successes = [
      ...customSuccesses,
      ...mapSimulationValidation({
        collateralToken,
        items: simulationSuccesses,
        productType,
        protocol,
        quoteToken,
        token,
      }),
    ]

    return {
      errors,
      hasErrors: errors.length > 0,
      isFormFrozen,
      isFormValid: isOmniFormValid({ currentStep, productType, state, earnIsFormValid }),
      notices,
      successes,
      warnings: errors.length > 0 ? [] : warnings,
    }
  }
