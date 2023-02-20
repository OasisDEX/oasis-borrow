import { AjnaValidationItem } from 'actions/ajna/types'
import BigNumber from 'bignumber.js'
import { ValidationMessagesInput } from 'components/ValidationMessages'
import { AjnaBorrowFormState } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { AjnaFormState, AjnaProduct, AjnaSidebarStep } from 'features/ajna/common/types'
import { AjnaEarnFormState } from 'features/ajna/earn/state/ajnaEarnFormReducto'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { TxError } from 'helpers/types'

interface GetAjnaBorrowValidationsParams {
  collateralBalance: BigNumber
  collateralToken: string
  currentStep: AjnaSidebarStep
  ethBalance: BigNumber
  ethPrice: BigNumber
  gasEstimationUsd?: BigNumber
  product: AjnaProduct
  quoteBalance: BigNumber
  simulationErrors?: AjnaValidationItem[]
  simulationWarnings?: AjnaValidationItem[]
  state: AjnaFormState
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
}: {
  currentStep: GetAjnaBorrowValidationsParams['currentStep']
  product: GetAjnaBorrowValidationsParams['product']
  state: GetAjnaBorrowValidationsParams['state']
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
      const { action, depositAmount, withdrawAmount } = state as AjnaEarnFormState

      switch (currentStep) {
        case 'setup':
        case 'manage':
          switch (action) {
            case 'open-earn':
            case 'deposit-earn':
              return !!depositAmount?.gt(0)
            case 'withdraw-earn':
              return !!withdrawAmount?.gt(0)
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
}: GetAjnaBorrowValidationsParams): {
  isFormValid: boolean
  errors: ValidationMessagesInput
  warnings: ValidationMessagesInput
} {
  const localErrors: { [key: string]: boolean } = {
    hasInsufficientEthFundsForTx: ethFundsForTxValidator({ txError }),
  }
  if ('depositAmount' in state)
    localErrors.depositAmountExceedsCollateralBalance = !!state.depositAmount?.gt(collateralBalance)
  if ('paybackAmount' in state)
    localErrors.paybackAmountExceedsDebtTokenBalance = !!state.paybackAmount?.gt(quoteBalance)

  const localWarnings = {
    hasPotentialInsufficientEthFundsForTx: notEnoughETHtoPayForTx({
      token: collateralToken,
      ethBalance,
      ethPrice,
      // TODO: this is an error, for all other actions than open and deposit, this deposit should be taken from different state value
      // e.g.: that error still might occur on payback action, but we're not checking for that
      depositAmount: state.depositAmount,
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
    isFormValid: errors.messages.length === 0 && isFormValid({ currentStep, product, state }),
    errors,
    warnings,
  }
}
