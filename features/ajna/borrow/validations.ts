import { AjnaValidationItem } from 'actions/ajna/types'
import BigNumber from 'bignumber.js'
import { AjnaValidationMessagesProps } from 'features/ajna/components/AjnaValidationMessages'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { TxError } from 'helpers/types'

function mapLocalValidation(item: { [key: string]: boolean }): AjnaValidationItem[] {
  return Object.entries(item)
    .filter(([_, value]) => value)
    .map(([key]) => ({ name: key }))
}

function reduceValidations(
  acc: AjnaValidationMessagesProps,
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

const defaultErrors: AjnaValidationMessagesProps = {
  messages: [],
  type: 'error',
  additionalData: {},
}

const defaultWarnings: AjnaValidationMessagesProps = {
  messages: [],
  type: 'warning',
  additionalData: {},
}

export function getAjnaBorrowValidations({
  collateralToken,
  depositAmount,
  paybackAmount,
  quoteBalance,
  collateralBalance,
  ethBalance,
  ethPrice,
  gasEstimationUsd,
  simulationErrors = [],
  simulationWarnings = [],
  txError,
}: {
  collateralToken: string
  collateralBalance: BigNumber
  quoteBalance: BigNumber
  ethBalance: BigNumber
  ethPrice: BigNumber
  depositAmount?: BigNumber
  paybackAmount?: BigNumber
  gasEstimationUsd?: BigNumber
  simulationErrors?: AjnaValidationItem[]
  simulationWarnings?: AjnaValidationItem[]
  txError?: TxError
}): { errors: AjnaValidationMessagesProps; warnings: AjnaValidationMessagesProps } {
  const localErrors = {
    depositAmountExceedsCollateralBalance: !!depositAmount?.gt(collateralBalance),
    paybackAmountExceedsDebtTokenBalance: !!paybackAmount?.gt(quoteBalance),
    hasInsufficientEthFundsForTx: ethFundsForTxValidator({ txError }),
  }

  const localWarnings = {
    hasPotentialInsufficientEthFundsForTx: notEnoughETHtoPayForTx({
      token: collateralToken,
      ethBalance,
      ethPrice,
      depositAmount,
      gasEstimationUsd,
    }),
  }

  const mappedErrors = [...mapLocalValidation(localErrors), ...simulationErrors]
  const mappedWarnings = [...mapLocalValidation(localWarnings), ...simulationWarnings]

  return {
    errors: mappedErrors.reduce(
      (acc, curr) => reduceValidations(acc, curr, 'error'),
      defaultErrors,
    ),
    warnings: mappedWarnings.reduce(
      (acc, curr) => reduceValidations(acc, curr, 'warning'),
      defaultWarnings,
    ),
  }
}

export const ajnaDepositErrors = ['depositAmountExceedsCollateralBalance']
export const ajnaCommonErrors = ['hasInsufficientEthFundsForTx']
export const ajnaPaybackErrors = ['paybackAmountExceedsDebtTokenBalance']
export const ajnaGenerateErrors = [] as string[]
export const ajnaWithdrawErrors = [] as string[]

export const ajnaCommonWarnings = ['hasPotentialInsufficientEthFundsForTx']
export const ajnaGenerateWarnings = [] as string[]
export const ajnaPaybackWarnings = [] as string[]
export const ajnaWithdrawWarnings = [] as string[]
export const ajnaDepositWarnings = [] as string[]
