import {
  getOmniCommonValidations,
  getOmniLendingValidations,
  mapOmniValidations,
} from 'features/omni-kit/helpers'
import { resolveOmniValidations } from 'features/omni-kit/helpers/resolveOmniValidations'
import type {
  GetOmniValidationsParams,
  OmniValidationItem,
  OmniValidations,
} from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

export function getOmniValidations({
  safetySwitchOn,
  collateralBalance,
  collateralToken,
  currentStep,
  earnIsFormValid = false,
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
  isFormFrozen,
  customErrors = [],
  customWarnings = [],
  protocolLabel,
}: GetOmniValidationsParams): OmniValidations {
  const localErrors: OmniValidationItem[] = [...customErrors]
  const localWarnings: OmniValidationItem[] = [...customWarnings]
  const localNotices: OmniValidationItem[] = []
  const localSuccesses: OmniValidationItem[] = []
  const isEarnProduct = productType === OmniProductType.Earn
  const token = isEarnProduct ? quoteToken : collateralToken

  const commonValidations = getOmniCommonValidations({
    collateralToken,
    quoteToken,
    state,
    txError,
    productType,
    ethBalance,
    ethPrice,
    gasEstimationUsd,
  })

  const lendingValidations = getOmniLendingValidations({
    safetySwitchOn,
    collateralBalance,
    isOpening,
    position,
    state,
    quoteBalance,
    protocolLabel,
  })

  const { errors, warnings, notices, successes } = mapOmniValidations({
    localErrors,
    localWarnings,
    localSuccesses,
    localNotices,
    commonValidations,
    lendingValidations,
    simulationWarnings,
    simulationSuccesses,
    simulationNotices,
    simulationErrors,
    collateralToken,
    quoteToken,
    token,
  })

  return resolveOmniValidations({
    currentStep,
    productType,
    errors,
    earnIsFormValid,
    isFormFrozen,
    successes,
    notices,
    state,
    warnings,
  })
}
