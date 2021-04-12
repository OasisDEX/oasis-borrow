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
  | 'withdrawAmountExceedsNextFreeCollateral'
  | 'generateAmountExceedsDebtCeiling'
  | 'generateAmountExceedsMaxDaiThatCanBeGenerated'
  | 'generateAmountLessThanDebtFloor'
  | 'paybackAmountExceedsDaiBalance'
  | 'paybackAmountExceedsVaultDebt'
  | 'paybackAmountCausesVaultDebtToBeLessThanDebtFloor'
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
    generateAmount,
    afterCollateralizationRatio,
    afterNextCollateralizationRatio,
    paybackAmount,
    withdrawAmount,
    stage,
    collateralAllowanceAmount,
    daiAllowanceAmount,
    accountIsController,
    shouldPaybackAll,
    daiYieldFromTotalCollateral,
    vault,
    ilkData,
    balanceInfo,
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

  if (depositAmount?.gt(balanceInfo.collateralBalance)) {
    errorMessages.push('depositAmountExceedsCollateralBalance')
  }

  if (withdrawAmount?.gt(vault.freeCollateral)) {
    errorMessages.push('withdrawAmountExceedsFreeCollateral')
  }

  if (generateAmount?.gt(ilkData.ilkDebtAvailable)) {
    errorMessages.push('generateAmountExceedsDebtCeiling')
  }

  if (generateAmount?.gt(daiYieldFromTotalCollateral)) {
    errorMessages.push('generateAmountExceedsMaxDaiThatCanBeGenerated')
  }

  if (generateAmount?.plus(vault.debt).lt(ilkData.debtFloor)) {
    errorMessages.push('generateAmountLessThanDebtFloor')
  }

  if (paybackAmount?.gt(balanceInfo.daiBalance)) {
    errorMessages.push('paybackAmountExceedsDaiBalance')
  }

  if (paybackAmount?.gt(vault.approximateDebt)) {
    errorMessages.push('paybackAmountExceedsVaultDebt')
  }

  if (
    paybackAmount &&
    vault.debt.minus(paybackAmount).lt(ilkData.debtFloor) &&
    vault.debt.minus(paybackAmount).gt(zero) &&
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
    afterCollateralizationRatio.lt(ilkData.liquidationRatio) &&
    !afterCollateralizationRatio.isZero()
  ) {
    errorMessages.push('vaultWillBeUnderCollateralized')
  }

  if (
    (generateAmount?.gt(zero) || withdrawAmount?.gt(zero)) &&
    afterNextCollateralizationRatio.lt(ilkData.liquidationRatio) &&
    !afterNextCollateralizationRatio.isZero() &&
    !afterCollateralizationRatio.eq(afterNextCollateralizationRatio)
  ) {
    errorMessages.push('vaultWillBeUnderCollateralizedAtNextPrice')
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
    proxyAddress,
    collateralAllowance,
    daiAllowance,
    accountIsController,
    afterCollateralizationRatio,
    collateralizationWarningThreshold,
    collateralizationDangerThreshold,
    shouldPaybackAll,
    vault,
    ilkData,
  } = state

  const warningMessages: ManageVaultWarningMessage[] = []

  if (
    depositAmountUSD &&
    depositAmount?.gt(zero) &&
    vault.debt.plus(depositAmountUSD).lt(ilkData.debtFloor)
  ) {
    warningMessages.push('potentialGenerateAmountLessThanDebtFloor')
  }

  if (!proxyAddress) {
    warningMessages.push('noProxyAddress')
  }

  if (vault.debt.lt(ilkData.debtFloor) && vault.debt.gt(zero)) {
    warningMessages.push('debtIsLessThanDebtFloor')
  }

  if (vault.token !== 'ETH') {
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
    vault.collateralizationRatio.gt(ilkData.liquidationRatio) &&
    vault.collateralizationRatio.lte(collateralizationDangerThreshold)
  ) {
    warningMessages.push('vaultAtRiskLevelDanger')
  }

  if (
    vault.collateralizationRatio.gt(collateralizationDangerThreshold) &&
    vault.collateralizationRatio.lte(collateralizationWarningThreshold)
  ) {
    warningMessages.push('vaultAtRiskLevelWarning')
  }

  if (
    afterCollateralizationRatio.gt(ilkData.liquidationRatio) &&
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

  if (
    vault.collateralizationRatio.lt(ilkData.liquidationRatio) &&
    !vault.collateralizationRatio.isZero()
  ) {
    warningMessages.push('vaultUnderCollateralized')
  }

  if (shouldPaybackAll) {
    warningMessages.push('payingBackAllOutstandingDebt')
  }

  return { ...state, warningMessages }
}
