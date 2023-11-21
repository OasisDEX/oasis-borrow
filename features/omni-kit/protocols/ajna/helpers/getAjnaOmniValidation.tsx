import type BigNumber from 'bignumber.js'
import type {
  AjnaBorrowishPositionAuction,
  AjnaEarnPositionAuction,
  AjnaPositionAuction,
} from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import {
  AjnaSafetyOnMessage,
  AjnaValidationWithLink,
  mapSimulationValidation,
} from 'features/ajna/positions/common/validation'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { isOmniFormValid } from 'features/omni-kit/helpers/isOmniFormValid'
import type {
  OmniFormState,
  OmniGenericPosition,
  OmniSidebarStep,
  OmniSimulationCommon,
  OmniValidationItem,
} from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import type { TxError } from 'helpers/types'
import { zero } from 'helpers/zero'
import React from 'react'

interface GetOmniBorrowValidationsParams {
  ajnaSafetySwitchOn: boolean
  collateralBalance: BigNumber
  collateralToken: string
  currentStep: OmniSidebarStep
  earnIsFormValid: boolean
  ethBalance: BigNumber
  ethPrice: BigNumber
  gasEstimationUsd?: BigNumber
  isOpening: boolean
  position: OmniGenericPosition
  positionAuction: AjnaPositionAuction
  productType: OmniProductType
  quoteBalance: BigNumber
  quoteToken: string
  simulationErrors?: OmniSimulationCommon['errors']
  simulationNotices?: OmniSimulationCommon['notices']
  simulationSuccesses?: OmniSimulationCommon['successes']
  simulationWarnings?: OmniSimulationCommon['warnings']
  state: OmniFormState
  txError?: TxError
}

interface AjnaOmniValidation {
  isFormValid: boolean
  isFormFrozen: boolean
  hasErrors: boolean
  errors: OmniValidationItem[]
  warnings: OmniValidationItem[]
  notices: OmniValidationItem[]
  successes: OmniValidationItem[]
}

export function getAjnaOmniValidation({
  ajnaSafetySwitchOn,
  collateralBalance,
  collateralToken,
  currentStep,
  earnIsFormValid,
  ethBalance,
  ethPrice,
  gasEstimationUsd,
  isOpening,
  position,
  positionAuction,
  productType,
  quoteBalance,
  quoteToken,
  simulationErrors = [],
  simulationNotices = [],
  simulationSuccesses = [],
  simulationWarnings = [],
  state,
  txError,
}: GetOmniBorrowValidationsParams): AjnaOmniValidation {
  const localErrors: OmniValidationItem[] = []
  const localWarnings: OmniValidationItem[] = []
  const localNotices: OmniValidationItem[] = []
  const localSuccesses: OmniValidationItem[] = []
  const isEarnProduct = productType === OmniProductType.Earn
  const depositBalance = isEarnProduct ? quoteBalance : collateralBalance
  const token = isEarnProduct ? quoteToken : collateralToken

  if (ethFundsForTxValidator({ txError })) {
    localErrors.push({
      message: {
        translationKey: 'has-insufficient-eth-funds-for-tx',
      },
    })
  }

  if ('depositAmount' in state && state.depositAmount?.gt(depositBalance)) {
    localErrors.push({ message: { translationKey: 'deposit-amount-exceeds-collateral-balance' } })
  }
  if ('paybackAmount' in state && state.paybackAmount?.gt(quoteBalance)) {
    localErrors.push({ message: { translationKey: 'payback-amount-exceeds-debt-token-balance' } })
  }

  if (ajnaSafetySwitchOn && !isOpening) {
    switch (productType) {
      case OmniProductType.Borrow:
      case OmniProductType.Multiply:
        if (
          'debtAmount' in position &&
          position.debtAmount?.isZero() &&
          (('loanToValue' in state && state.loanToValue?.gt(zero)) ||
            ('depositAmount' in state && state.depositAmount?.gt(zero)) ||
            ('paybackAmount' in state && state.paybackAmount?.gt(zero)) ||
            ('generateAmount' in state && state.generateAmount?.gt(zero)))
        ) {
          localErrors.push({
            message: { component: <AjnaSafetyOnMessage /> },
          })
        }

        break
      case OmniProductType.Earn:
        if (
          'quoteTokenAmount' in position &&
          position.quoteTokenAmount?.isZero() &&
          'depositAmount' in state &&
          state.depositAmount?.gt(zero)
        ) {
          localErrors.push({
            message: { component: <AjnaSafetyOnMessage /> },
          })
        }

        break
    }
  }

  const hasPotentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token: isEarnProduct ? quoteToken : collateralToken,
    ethBalance,
    ethPrice,
    depositAmount:
      'paybackAmount' in state && state.paybackAmount?.gt(zero) && quoteToken === 'ETH'
        ? state.paybackAmount
        : state.depositAmount,
    gasEstimationUsd,
  })

  if (hasPotentialInsufficientEthFundsForTx) {
    localWarnings.push({
      message: { translationKey: 'has-potential-insufficient-eth-funds-for-tx' },
    })
  }

  if (productType !== OmniProductType.Earn) {
    const borrowishAuction = positionAuction as AjnaBorrowishPositionAuction

    if (borrowishAuction.isBeingLiquidated) {
      localWarnings.push({
        message: {
          component: <AjnaValidationWithLink name="is-being-liquidated" />,
        },
      })
    }
  }

  const errors = [
    ...localErrors,
    ...mapSimulationValidation({ items: simulationErrors, collateralToken, quoteToken, token }),
  ]

  const warnings = [
    ...localWarnings,
    ...mapSimulationValidation({ items: simulationWarnings, collateralToken, quoteToken, token }),
  ]
  const notices = [
    ...localNotices,
    ...mapSimulationValidation({ items: simulationNotices, collateralToken, quoteToken, token }),
  ]
  const successes = [
    ...localSuccesses,
    ...mapSimulationValidation({ items: simulationSuccesses, collateralToken, quoteToken, token }),
  ]

  const isFormFrozen =
    productType === OmniProductType.Earn &&
    (positionAuction as AjnaEarnPositionAuction).isBucketFrozen

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
