import { maxUint256 } from 'blockchain/calls/erc20'
import { zero } from 'helpers/zero'

import { ManageVaultState } from './manageVault'

export type ManageVaultErrorMessage =
  | 'depositAndWithdrawAmountsEmpty'
  | 'generateAndPaybackAmountsEmpty'
  | 'depositAmountGreaterThanMaxDepositAmount'
  | 'withdrawAmountGreaterThanMaxWithdrawAmount'
  | 'generateAmountGreaterThanMaxGenerateAmount'
  | 'paybackAmountGreaterThanMaxPaybackAmount'
  | 'generateAmountLessThanDebtFloor'
  | 'generateAmountGreaterThanDebtCeiling'
  | 'paybackAmountLessThanDebtFloor'
  | 'vaultWillBeUnderCollateralized'
  | 'vaultIsUnderCollateralized'
  | 'collateralAllowanceAmountEmpty'
  | 'customCollateralAllowanceAmountGreaterThanMaxUint256'
  | 'customCollateralAllowanceAmountLessThanDepositAmount'
  | 'daiAllowanceAmountEmpty'
  | 'customDaiAllowanceAmountGreaterThanMaxUint256'
  | 'customDaiAllowanceAmountLessThanPaybackAmount'

export type ManageVaultWarningMessage =
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'debtIsLessThanDebtFloor'
  | 'noProxyAddress'
  | 'noCollateralAllowance'
  | 'noDaiAllowance'
  | 'collateralAllowanceLessThanDepositAmount'
  | 'daiAllowanceLessThanPaybackAmount'
  | 'connectedAccountIsNotVaultController'
  | 'vaultIsAtRiskLevelDanger'
  | 'vaultWillBeAtRiskLevelDanger'
  | 'vaultIsPotentiallyAtRiskLevelWarning'
  | 'vaultWillBePotentiallyBeAtRiskLevelWarning'

export function validateErrors(state: ManageVaultState): ManageVaultState {
  const {
    depositAmount,
    maxDepositAmount,

    generateAmount,
    maxGenerateAmount,
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
    collateralizationRatio,
  } = state

  const errorMessages: ManageVaultErrorMessage[] = []

  if (
    (!depositAmount || depositAmount.isZero()) &&
    (!withdrawAmount || withdrawAmount.isZero()) &&
    stage === 'collateralEditing'
  ) {
    errorMessages.push('depositAndWithdrawAmountsEmpty')
  }

  if (
    (!generateAmount || generateAmount.isZero()) &&
    (!paybackAmount || paybackAmount.isZero()) &&
    stage === 'daiEditing'
  ) {
    errorMessages.push('generateAndPaybackAmountsEmpty')
  }

  if (depositAmount?.gt(maxDepositAmount)) {
    // maxDepositAmount currently means just the users collateral balance but
    // could in the future account for gas less the deposit amount
    errorMessages.push('depositAmountGreaterThanMaxDepositAmount')
  }

  if (withdrawAmount?.gt(maxWithdrawAmount)) {
    errorMessages.push('withdrawAmountGreaterThanMaxWithdrawAmount')
  }

  if (generateAmount?.lt(maxGenerateAmount)) {
    errorMessages.push('generateAmountGreaterThanMaxGenerateAmount')
  }

  if (generateAmount?.plus(debt).lt(debtFloor)) {
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

  if (collateralizationRatio.lt(liquidationRatio)) {
    errorMessages.push('vaultIsUnderCollateralized')
  }

  if (
    (generateAmount?.gt(zero) || withdrawAmount?.gt(zero)) &&
    afterCollateralizationRatio.lt(liquidationRatio)
  ) {
    errorMessages.push('vaultWillBeUnderCollateralized')
  }

  return { ...state, errorMessages }
}

export function validateWarnings(state: ManageVaultState): ManageVaultState {
  const {
    depositAmount,
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

  if (debt.lt(debtFloor)) {
    warningMessages.push('debtIsLessThanDebtFloor')
  }

  if (token !== 'ETH') {
    if (!collateralAllowance) {
      warningMessages.push('noCollateralAllowance')
    }
    if (depositAmount && collateralAllowance && depositAmount.gt(collateralAllowance)) {
      warningMessages.push('collateralAllowanceLessThanDepositAmount')
    }
  }

  if (!daiAllowance) {
    warningMessages.push('noDaiAllowance')
  }

  if (paybackAmount && daiAllowance && paybackAmount.gt(daiAllowance)) {
    warningMessages.push('daiAllowanceLessThanPaybackAmount')
  }

  return { ...state, warningMessages }
}
