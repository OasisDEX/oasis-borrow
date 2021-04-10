import { maxUint256 } from 'blockchain/calls/erc20'
import { zero } from 'helpers/zero'

import { ManageVaultState } from './manageVault'

export type ManageVaultErrorMessage =
  | 'depositAmountEmpty'
  | 'paybackAmountEmpty'
  | 'depositAndWithdrawAmountsEmpty'
  | 'generateAndPaybackAmountsEmpty'
  | 'depositAmountExceedsCollateralBalance'
  | 'withdrawAmountExceedsFreeCollateral'
  | 'generateAmountExceedsDebtCeiling'
  | 'generateAmountExceedsMaxDaiThatCanBeGenerated'
  | 'generateAmountLessThanDebtFloor'
  | 'paybackAmountExceedsDaiBalance'
  | 'paybackAmountExceedsVaultDebt'
  | 'paybackAmountCausesVaultDebtToBeLessThanDebtFloor'

  // | 'depositAmountGreaterThanMaxDepositAmount'
  // | 'generateAmountGreaterThanMaxGenerateAmount'
  // | 'paybackAmountGreaterThanMaxPaybackAmount'
  | 'vaultWillBeUnderCollateralizedAtNextPrice'
  | 'vaultWillBeUnderCollateralized'
  | 'collateralAllowanceAmountEmpty'
  | 'customCollateralAllowanceAmountGreaterThanMaxUint256'
  | 'customCollateralAllowanceAmountLessThanDepositAmount'
  | 'daiAllowanceAmountEmpty'
  | 'customDaiAllowanceAmountGreaterThanMaxUint256'
  | 'customDaiAllowanceAmountLessThanPaybackAmount'

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
    accountIsController,
    shouldPaybackAll,
    collateralBalance,
    freeCollateral,
    daiYieldFromTotalCollateral,
    daiBalance,
    roundedDebt,
  } = state

  const errorMessages: ManageVaultErrorMessage[] = []

  if (
    accountIsController &&
    (!depositAmount || depositAmount.isZero()) &&
    (!withdrawAmount || withdrawAmount.isZero()) &&
    stage === 'collateralEditing'
  ) {
    errorMessages.push('depositAndWithdrawAmountsEmpty')
  }

  if (
    accountIsController &&
    (!generateAmount || generateAmount.isZero()) &&
    (!paybackAmount || paybackAmount.isZero()) &&
    stage === 'daiEditing'
  ) {
    errorMessages.push('generateAndPaybackAmountsEmpty')
  }

  if (
    !accountIsController &&
    (!depositAmount || depositAmount.isZero()) &&
    stage === 'collateralEditing'
  ) {
    errorMessages.push('depositAmountEmpty')
  }

  if (
    !accountIsController &&
    (!paybackAmount || paybackAmount.isZero()) &&
    stage === 'daiEditing'
  ) {
    errorMessages.push('paybackAmountEmpty')
  }

  if (depositAmount?.gt(collateralBalance)) {
    errorMessages.push('depositAmountExceedsCollateralBalance')
  }

  if (withdrawAmount?.gt(freeCollateral)) {
    errorMessages.push('withdrawAmountExceedsFreeCollateral')
  }

  if (generateAmount?.gt(ilkDebtAvailable)) {
    errorMessages.push('generateAmountExceedsDebtCeiling')
  }

  if (generateAmount?.gt(daiYieldFromTotalCollateral)) {
    errorMessages.push('generateAmountExceedsMaxDaiThatCanBeGenerated')
  }

  if (generateAmount?.plus(debt).lt(debtFloor)) {
    errorMessages.push('generateAmountLessThanDebtFloor')
  }

  if (paybackAmount?.gt(daiBalance)) {
    errorMessages.push('paybackAmountExceedsDaiBalance')
  }

  if (paybackAmount?.gt(roundedDebt)) {
    errorMessages.push('paybackAmountExceedsVaultDebt')
  }

  if (
    paybackAmount &&
    debt.minus(paybackAmount).lt(debtFloor) &&
    debt.minus(paybackAmount).gt(zero) &&
    !shouldPaybackAll
  ) {
    errorMessages.push('paybackAmountCausesVaultDebtToBeLessThanDebtFloor')
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

  if (
    (generateAmount?.gt(zero) || withdrawAmount?.gt(zero)) &&
    afterCollateralizationRatio.lt(liquidationRatio)
  ) {
    errorMessages.push('vaultWillBeUnderCollateralized')
  }

  return { ...state, errorMessages }
}

export type ManageVaultWarningMessage =
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'debtIsLessThanDebtFloor'
  | 'noProxyAddress'
  | 'noCollateralAllowance'
  | 'noDaiAllowance'
  | 'collateralAllowanceLessThanDepositAmount'
  | 'daiAllowanceLessThanPaybackAmount'
  | 'connectedAccountIsNotVaultController'
  | 'vaultAtRiskLevelDanger'
  | 'vaultAtRiskLevelWarning'
  | 'vaultWillBeAtRiskLevelDanger'
  | 'vaultWillBeAtRiskLevelWarning'
  | 'vaultWillBeAtRiskLevelDangerAtNextPrice'
  | 'vaultWillBeAtRiskLevelWarningAtNextPrice'
  | 'vaultUnderCollateralized'
  | 'payingBackAllOutstandingDebt'

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
    accountIsController,
    collateralizationRatio,
    afterCollateralizationRatio,
    collateralizationWarningThreshold,
    collateralizationDangerThreshold,
    liquidationRatio,
    shouldPaybackAll,
  } = state

  const warningMessages: ManageVaultWarningMessage[] = []

  if (depositAmountUSD && depositAmount?.gt(zero) && debt.plus(depositAmountUSD).lt(debtFloor)) {
    warningMessages.push('potentialGenerateAmountLessThanDebtFloor')
  }

  if (!proxyAddress) {
    warningMessages.push('noProxyAddress')
  }

  if (debt.lt(debtFloor) && debt.gt(zero)) {
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

  if (!accountIsController) {
    warningMessages.push('connectedAccountIsNotVaultController')
  }

  if (
    collateralizationRatio.gt(liquidationRatio) &&
    collateralizationRatio.lte(collateralizationDangerThreshold)
  ) {
    warningMessages.push('vaultAtRiskLevelDanger')
  }

  if (
    collateralizationRatio.gt(collateralizationDangerThreshold) &&
    collateralizationRatio.lte(collateralizationWarningThreshold)
  ) {
    warningMessages.push('vaultAtRiskLevelWarning')
  }

  if (
    afterCollateralizationRatio.gt(liquidationRatio) &&
    afterCollateralizationRatio.lte(collateralizationDangerThreshold)
  ) {
    warningMessages.push('vaultAtRiskLevelDanger')
  }

  if (
    afterCollateralizationRatio.gt(collateralizationDangerThreshold) &&
    afterCollateralizationRatio.lte(collateralizationWarningThreshold)
  ) {
    warningMessages.push('vaultAtRiskLevelWarning')
  }

  if (collateralizationRatio.lt(liquidationRatio) && !collateralizationRatio.isZero()) {
    warningMessages.push('vaultUnderCollateralized')
  }

  if (shouldPaybackAll) {
    warningMessages.push('payingBackAllOutstandingDebt')
  }

  return { ...state, warningMessages }
}
