import type {
  AjnaBorrowishPositionAuction,
  AjnaEarnPositionAuction,
} from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import {
  AjnaSafetyOnMessage,
  AjnaValidationWithLink,
  mapSimulationValidation,
} from 'features/ajna/positions/common/validation'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { isOmniFormValid } from 'features/omni-kit/helpers/isOmniFormValid'
import type { GetOmniBorrowValidationsParams, OmniValidationItem } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import React from 'react'

export function getAjnaOmniValidation({
  ajnaSafetySwitchOn,
  flow,
  collateralBalance,
  collateralToken,
  quoteToken,
  currentStep,
  ethBalance,
  ethPrice,
  gasEstimationUsd,
  product,
  quoteBalance,
  simulationErrors = [],
  simulationWarnings = [],
  simulationNotices = [],
  simulationSuccesses = [],
  state,
  txError,
  position,
  positionAuction,
  earnIsFormValid,
}: GetOmniBorrowValidationsParams): {
  isFormValid: boolean
  isFormFrozen: boolean
  hasErrors: boolean
  errors: OmniValidationItem[]
  warnings: OmniValidationItem[]
  notices: OmniValidationItem[]
  successes: OmniValidationItem[]
} {
  const localErrors: OmniValidationItem[] = []
  const localWarnings: OmniValidationItem[] = []
  const localNotices: OmniValidationItem[] = []
  const localSuccesses: OmniValidationItem[] = []
  const isEarnProduct = product === 'earn'
  const depositBalance = isEarnProduct ? quoteBalance : collateralBalance
  const token = product === 'earn' ? quoteToken : collateralToken

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

  if (ajnaSafetySwitchOn && flow === 'manage') {
    switch (product) {
      case 'borrow':
      case 'multiply':
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
      case 'earn':
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

  if (['borrow', 'multiply'].includes(product)) {
    const borrowishAuction = positionAuction as AjnaBorrowishPositionAuction

    if (borrowishAuction.isDuringGraceTime) {
      localWarnings.push({
        message: {
          component: <AjnaValidationWithLink name="is-during-grace-time" />,
        },
      })
    }

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
    product === 'earn' && (positionAuction as AjnaEarnPositionAuction).isBucketFrozen

  return {
    isFormValid: isOmniFormValid({ currentStep, product, state, earnIsFormValid }),
    hasErrors: errors.length > 0,
    isFormFrozen,
    errors,
    warnings: errors.length > 0 ? [] : warnings,
    notices,
    successes,
  }
}
