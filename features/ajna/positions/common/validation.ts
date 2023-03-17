import { AjnaEarnPosition } from '@oasisdex/oasis-actions-poc'
import { AjnaValidationItem } from 'actions/ajna/types'
import BigNumber from 'bignumber.js'
import { ValidationMessagesInput } from 'components/ValidationMessages'
import {
  AjnaFormState,
  AjnaGenericPosition,
  AjnaProduct,
  AjnaSidebarStep,
} from 'features/ajna/common/types'
import { AjnaBorrowFormState } from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto'
import { areEarnPricesEqual } from 'features/ajna/positions/earn/helpers/areEarnPricesEqual'
import { AjnaEarnFormState } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { TxError } from 'helpers/types'
import { zero } from 'helpers/zero'

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
  txError?: TxError
}

export const defaultErrors: ValidationMessagesInput = {
  messages: [],
  type: 'error',
  additionalData: {},
}

export const defaultWarnings: ValidationMessagesInput = {
  messages: [],
  type: 'warning',
  additionalData: {},
}

function mapLocalValidation(item: { [key: string]: boolean }): AjnaValidationItem[] {
  return Object.entries(item)
    .filter(([_, value]) => value)
    .map(([key]) => ({ name: key }))
}

function reduceValidations(
  acc: ValidationMessagesInput,
  curr: AjnaValidationItem,
  type: 'error' | 'warning',
) {
  return {
    messages: [...acc.messages, curr.name],
    type,
    additionalData: {
      ...acc.additionalData,
      ...curr.data,
    },
  }
}

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
      const {
        action,
        generateAmount,
        depositAmount,
        paybackAmount,
        withdrawAmount,
      } = state as AjnaBorrowFormState

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
            default:
              return false
          }
        default:
          return true
      }
    }
    case 'earn': {
      const { action, depositAmount, withdrawAmount, price } = state as AjnaEarnFormState

      switch (currentStep) {
        case 'setup':
        case 'manage':
          switch (action) {
            case 'open-earn':
              return !!depositAmount?.gt(0)
            case 'deposit-earn':
              return (
                !!depositAmount?.gt(0) ||
                !areEarnPricesEqual((position as AjnaEarnPosition).price, price)
              )
            case 'withdraw-earn':
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
      return false
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
}: GetAjnaBorrowValidationsParams): {
  isFormValid: boolean
  errors: ValidationMessagesInput
  warnings: ValidationMessagesInput
} {
  const localErrors: { [key: string]: boolean } = {
    hasInsufficientEthFundsForTx: ethFundsForTxValidator({ txError }),
  }
  const isEarnProduct = product === 'earn'
  const depositBalance = isEarnProduct ? quoteBalance : collateralBalance

  if ('depositAmount' in state)
    localErrors.depositAmountExceedsCollateralBalance = !!state.depositAmount?.gt(depositBalance)
  if ('paybackAmount' in state)
    localErrors.paybackAmountExceedsDebtTokenBalance = !!state.paybackAmount?.gt(quoteBalance)

  const localWarnings = {
    hasPotentialInsufficientEthFundsForTx: notEnoughETHtoPayForTx({
      token: isEarnProduct ? quoteToken : collateralToken,
      ethBalance,
      ethPrice,
      depositAmount:
        'paybackAmount' in state && state.paybackAmount?.gt(zero) && quoteToken === 'ETH'
          ? state.paybackAmount
          : state.depositAmount,
      gasEstimationUsd,
    }),
  }

  const errors = [...mapLocalValidation(localErrors), ...simulationErrors].reduce(
    (acc, curr) => reduceValidations(acc, curr, 'error'),
    defaultErrors,
  )
  const warnings = [...mapLocalValidation(localWarnings), ...simulationWarnings].reduce(
    (acc, curr) => reduceValidations(acc, curr, 'warning'),
    defaultWarnings,
  )

  return {
    isFormValid:
      errors.messages.length === 0 && isFormValid({ currentStep, product, state, position }),
    errors,
    warnings,
  }
}
