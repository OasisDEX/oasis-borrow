import { maxUint256 } from 'blockchain/calls/erc20'
import { zero } from 'helpers/zero'

import { ManageVaultState } from './manageVault'

export type ManageVaultErrorMessage =
  | 'depositAmountGreaterThanMaxDepositAmount'
  | 'withdrawAmountGreaterThanMaxWithdrawAmount'
  | 'generateAmountLessThanDebtFloor'
  | 'generateAmountGreaterThanDebtCeiling'
  | 'paybackAmountGreaterThanMaxPaybackAmount'
  | 'paybackAmountLessThanDebtFloor'
  | 'vaultUnderCollateralized'
  | 'collateralAllowanceAmountEmpty'
  | 'customCollateralAllowanceAmountGreaterThanMaxUint256'
  | 'customCollateralAllowanceAmountLessThanDepositAmount'
  | 'daiAllowanceAmountEmpty'
  | 'customDaiAllowanceAmountGreaterThanMaxUint256'
  | 'customDaiAllowanceAmountLessThanPaybackAmount'

export type ManageVaultWarningMessage =
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'noProxyAddress'
  | 'noCollateralAllowance'
  | 'noDaiAllowance'
  | 'collateralAllowanceLessThanDepositAmount'
  | 'daiAllowanceLessThanPaybackAmount'

export function validateErrors(state: ManageVaultState): ManageVaultState {
  const {
    depositAmount,
    maxDepositAmount,
    generateAmount,
    debtFloor,
    ilkDebtAvailable,
    afterCollateralizationRatio,
    liquidationRatio,
    paybackAmount,
    withdrawAmount,
    maxWithdrawAmount,
    maxPaybackAmount,
    debt,
    stage,
    collateralAllowanceAmount,
    daiAllowanceAmount,
  } = state

  const errorMessages: ManageVaultErrorMessage[] = []

  if (depositAmount?.gt(maxDepositAmount)) {
    errorMessages.push('depositAmountGreaterThanMaxDepositAmount')
  }

  if (withdrawAmount?.gt(maxWithdrawAmount)) {
    errorMessages.push('withdrawAmountGreaterThanMaxWithdrawAmount')
  }

  if (generateAmount && debt.plus(generateAmount).lt(debtFloor)) {
    errorMessages.push('generateAmountLessThanDebtFloor')
  }

  if (generateAmount?.gt(ilkDebtAvailable)) {
    errorMessages.push('generateAmountGreaterThanDebtCeiling')
  }

  if (paybackAmount?.gt(maxPaybackAmount)) {
    errorMessages.push('paybackAmountGreaterThanMaxPaybackAmount')
  }

  if (
    paybackAmount &&
    debt.minus(paybackAmount).lt(debtFloor) &&
    debt.minus(paybackAmount).gt(zero)
  ) {
    errorMessages.push('paybackAmountLessThanDebtFloor')
  }

  if (
    stage === 'collateralAllowanceWaitingForConfirmation' ||
    stage === 'collateralAllowanceFailure'
  ) {
    if (!collateralAllowanceAmount) {
      errorMessages.push('collateralAllowanceAmountEmpty')
    }
    if (collateralAllowanceAmount?.gt(maxUint256)) {
      errorMessages.push('customCollateralAllowanceAmountGreaterThanMaxUint256')
    }
    if (depositAmount && collateralAllowanceAmount && collateralAllowanceAmount.lt(depositAmount)) {
      errorMessages.push('customCollateralAllowanceAmountLessThanDepositAmount')
    }
  }

  if (stage === 'daiAllowanceWaitingForConfirmation' || stage === 'daiAllowanceFailure') {
    if (!daiAllowanceAmount) {
      errorMessages.push('daiAllowanceAmountEmpty')
    }
    if (daiAllowanceAmount?.gt(maxUint256)) {
      errorMessages.push('customDaiAllowanceAmountGreaterThanMaxUint256')
    }
    if (paybackAmount && daiAllowanceAmount && daiAllowanceAmount.lt(paybackAmount)) {
      errorMessages.push('customDaiAllowanceAmountLessThanPaybackAmount')
    }
  }

  if (generateAmount?.gt(zero) && afterCollateralizationRatio.lt(liquidationRatio)) {
    errorMessages.push('vaultUnderCollateralized')
  }

  return { ...state, errorMessages }
}

export function validateWarnings(state: ManageVaultState): ManageVaultState {
  const {
    depositAmount,
    generateAmount,
    withdrawAmount,
    paybackAmount,
    depositAmountUSD,
    debtFloor,
    proxyAddress,
    token,
    debt,
    collateralAllowance,
    daiAllowance,
  } = state

  const warningMessages: ManageVaultWarningMessage[] = []

  if (depositAmountUSD && depositAmount?.gt(zero) && debt.plus(depositAmountUSD).lt(debtFloor)) {
    warningMessages.push('potentialGenerateAmountLessThanDebtFloor')
  }

  if (!proxyAddress) {
    warningMessages.push('noProxyAddress')
  }

  if (!depositAmount) {
    warningMessages.push('depositAmountEmpty')
  }

  if (!generateAmount) {
    warningMessages.push('generateAmountEmpty')
  }

  if (!withdrawAmount) {
    warningMessages.push('withdrawAmountEmpty')
  }

  if (!paybackAmount) {
    warningMessages.push('paybackAmountEmpty')
  }

  if (token !== 'ETH') {
    if (!collateralAllowance) {
      warningMessages.push('noCollateralAllowance')
    }
    if (depositAmount && collateralAllowance && depositAmount.gt(collateralAllowance)) {
      warningMessages.push('collateralAllowanceLessThanDepositAmount')
    }
  }

  if (paybackAmount && daiAllowance && paybackAmount.gt(daiAllowance)) {
    warningMessages.push('daiAllowanceLessThanPaybackAmount')
  }

  return { ...state, warningMessages }
}
