import { AjnaEarnPosition } from '@oasisdex/dma-library'
import { AjnaValidationItem } from 'actions/ajna/types'
import BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import {
  AjnaFormState,
  AjnaGenericPosition,
  AjnaProduct,
  AjnaSidebarStep,
  AjnaValidationItems,
} from 'features/ajna/common/types'
import { AjnaBorrowFormState } from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto'
import {
  AjnaBorrowishPositionAuction,
  AjnaPositionAuction,
} from 'features/ajna/positions/common/observables/getAjnaPositionAuction'
import { areEarnPricesEqual } from 'features/ajna/positions/earn/helpers/areEarnPricesEqual'
import { AjnaEarnFormState } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto'
import { AjnaMultiplyFormState } from 'features/ajna/positions/multiply/state/ajnaMultiplyFormReducto'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { TxError } from 'helpers/types'
import { zero } from 'helpers/zero'
import { Trans } from 'next-i18next'
import React from 'react'

interface GetAjnaBorrowValidationsParams {
  collateralBalance: BigNumber
  collateralToken: string
  quoteToken: string
  currentStep: AjnaSidebarStep
  ethBalance: BigNumber
  ethPrice: BigNumber
  gasEstimationUsd?: BigNumber
  product: AjnaProduct
  quoteBalance: BigNumber
  simulationErrors?: AjnaValidationItem[]
  simulationWarnings?: AjnaValidationItem[]
  state: AjnaFormState
  position: AjnaGenericPosition
  positionAuction: AjnaPositionAuction
  txError?: TxError
}

const mapSimulationValidation = (items: AjnaValidationItem[]): AjnaValidationItems =>
  items.map((item) => ({ message: { translationKey: item.name, params: item.data } }))

function isFormValid({
  currentStep,
  product,
  state,
  position,
}: {
  currentStep: GetAjnaBorrowValidationsParams['currentStep']
  product: GetAjnaBorrowValidationsParams['product']
  state: GetAjnaBorrowValidationsParams['state']
  position: AjnaGenericPosition
}): boolean {
  switch (product) {
    case 'borrow': {
      const { action, generateAmount, depositAmount, paybackAmount, withdrawAmount } =
        state as AjnaBorrowFormState

      switch (currentStep) {
        case 'setup':
        case 'manage':
          switch (action) {
            case 'open-borrow':
            case 'deposit-borrow':
              return !!depositAmount?.gt(0)
            case 'withdraw-borrow':
              return !!withdrawAmount?.gt(0)
            case 'generate-borrow':
              return !!generateAmount?.gt(0)
            case 'payback-borrow':
              return !!paybackAmount?.gt(0)
            case 'switch-borrow':
              return true
            default:
              return false
          }
        default:
          return true
      }
    }
    case 'earn': {
      const { action, depositAmount, withdrawAmount, price } = state as AjnaEarnFormState

      const isEmptyPosition =
        (position as AjnaEarnPosition).quoteTokenAmount.isZero() &&
        (position as AjnaEarnPosition).price.isZero()

      switch (currentStep) {
        case 'setup':
        case 'manage':
          switch (action) {
            case 'open-earn':
              return !!depositAmount?.gt(0)
            case 'deposit-earn':
              if (isEmptyPosition) {
                return !!depositAmount?.gt(0)
              }

              return (
                !!depositAmount?.gt(0) ||
                !areEarnPricesEqual((position as AjnaEarnPosition).price, price)
              )
            case 'withdraw-earn':
              if (isEmptyPosition) {
                return !!withdrawAmount?.gt(0)
              }

              return (
                !!withdrawAmount?.gt(0) ||
                !areEarnPricesEqual((position as AjnaEarnPosition).price, price)
              )
            default:
              return false
          }
        default:
          return true
      }
    }
    case 'multiply':
      const { action, depositAmount } = state as AjnaMultiplyFormState

      switch (currentStep) {
        case 'setup':
        case 'manage':
          switch (action) {
            case 'open-multiply':
              return !!depositAmount?.gt(0)
            case 'switch-multiply':
              return true
            default:
              return false
          }
        default:
          return true
      }
  }
}

export function getAjnaValidation({
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
  state,
  txError,
  position,
  positionAuction,
}: GetAjnaBorrowValidationsParams): {
  isFormValid: boolean
  hasErrors: boolean
  errors: AjnaValidationItems
  warnings: AjnaValidationItems
} {
  const localErrors: AjnaValidationItems = []
  const localWarnings: AjnaValidationItems = []
  const isEarnProduct = product === 'earn'
  const depositBalance = isEarnProduct ? quoteBalance : collateralBalance

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
          component: (
            <Trans
              i18nKey="ajna.validations.is-during-grace-time"
              components={{
                1: <strong />,
                2: (
                  <AppLink
                    sx={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'regular' }}
                    // TODO update link to ajna liquidations once available
                    href={EXTERNAL_LINKS.KB.HELP}
                  />
                ),
              }}
            />
          ),
        },
      })
    }

    if (borrowishAuction.isBeingLiquidated) {
      localWarnings.push({
        message: {
          component: (
            <Trans
              i18nKey="ajna.validations.is-being-liquidated"
              components={{
                1: <strong />,
                2: (
                  <AppLink
                    sx={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'regular' }}
                    // TODO update link to ajna liquidations once available
                    href={EXTERNAL_LINKS.KB.HELP}
                  />
                ),
              }}
            />
          ),
        },
      })
    }
  }

  const errors = [...localErrors, ...mapSimulationValidation(simulationErrors)]
  const warnings = [...localWarnings, ...mapSimulationValidation(simulationWarnings)]

  return {
    isFormValid: isFormValid({ currentStep, product, state, position }),
    hasErrors: errors.length > 0,
    errors,
    warnings,
  }
}
