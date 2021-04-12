import { maxUint256 } from 'blockchain/calls/erc20'
import { priceInfoChange$ } from 'features/shared/priceInfo'
import { zero } from 'helpers/zero'

import { ManageVaultState } from './manageVault'

export type ManageVaultErrorMessage =
  | 'depositAndWithdrawAmountsEmpty'
  | 'generateAndPaybackAmountsEmpty'
  | 'depositAmountEmpty'
  | 'paybackAmountEmpty'
  | 'depositAmountExceedsCollateralBalance'
  | 'withdrawAmountExceedsFreeCollateral'
  | 'withdrawAmountExceedsFreeCollateralAtNextPrice'
  | 'generateAmountExceedsDaiYieldFromTotalCollateral'
  | 'generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice'
  | 'vaultWillBeUnderCollateralized'
  | 'vaultWillBeUnderCollateralizedAtNextPrice'
  | 'generateAmountExceedsDebtCeiling'
  | 'generateAmountLessThanDebtFloor'
  | 'paybackAmountExceedsDaiBalance'
  | 'paybackAmountExceedsVaultDebt'
  | 'paybackAmountCausesVaultDebtToBeLessThanDebtFloor'
  | 'customCollateralAllowanceAmountEmpty'
  | 'customCollateralAllowanceAmountGreaterThanMaxUint256'
  | 'customCollateralAllowanceAmountLessThanDepositAmount'
  | 'customDaiAllowanceAmountEmpty'
  | 'customDaiAllowanceAmountGreaterThanMaxUint256'
  | 'customDaiAllowanceAmountLessThanPaybackAmount'
  | 'depositingAllEthBalance'

export function validateErrors(state: ManageVaultState): ManageVaultState {
  const {
    depositAmount,
    generateAmount,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    paybackAmount,
    withdrawAmount,
    stage,
    collateralAllowanceAmount,
    daiAllowanceAmount,
    accountIsController,
    shouldPaybackAll,
    daiYieldFromTotalCollateral,
    daiYieldFromTotalCollateralAtNextPrice,
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

  const withdrawAmountExceedsFreeCollateral = withdrawAmount?.gt(vault.freeCollateral)

  if (withdrawAmountExceedsFreeCollateral) {
    errorMessages.push('withdrawAmountExceedsFreeCollateral')
  }

  const withdrawAmountExceedsFreeCollateralAtNextPrice = withdrawAmount?.gt(
    vault.freeCollateralAtNextPrice,
  )

  if (!withdrawAmountExceedsFreeCollateral && withdrawAmountExceedsFreeCollateralAtNextPrice) {
    errorMessages.push('withdrawAmountExceedsFreeCollateralAtNextPrice')
  }

  const generateAmountExceedsDaiYieldFromTotalCollateral = generateAmount?.gt(
    daiYieldFromTotalCollateral,
  )
  if (generateAmountExceedsDaiYieldFromTotalCollateral) {
    errorMessages.push('generateAmountExceedsDaiYieldFromTotalCollateral')
  }

  const generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice = generateAmount?.gt(
    daiYieldFromTotalCollateralAtNextPrice,
  )
  if (
    !generateAmountExceedsDaiYieldFromTotalCollateral &&
    generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice
  ) {
    errorMessages.push('generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice')
  }

  const vaultWillBeUnderCollateralized =
    (generateAmount?.gt(zero) || withdrawAmount?.gt(zero)) &&
    afterCollateralizationRatio.lt(ilkData.liquidationRatio) &&
    !afterCollateralizationRatio.isZero()

  if (vaultWillBeUnderCollateralized) {
    errorMessages.push('vaultWillBeUnderCollateralized')
  }

  const vaultWillBeUnderCollateralizedAtNextPrice =
    (generateAmount?.gt(zero) || withdrawAmount?.gt(zero)) &&
    afterCollateralizationRatioAtNextPrice.lt(ilkData.liquidationRatio) &&
    !afterCollateralizationRatioAtNextPrice.isZero()

  if (!vaultWillBeUnderCollateralized && vaultWillBeUnderCollateralizedAtNextPrice) {
    errorMessages.push('vaultWillBeUnderCollateralizedAtNextPrice')
  }

  if (generateAmount?.gt(ilkData.ilkDebtAvailable)) {
    errorMessages.push('generateAmountExceedsDebtCeiling')
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

  if (vault.token === 'ETH' && depositAmount?.eq(balanceInfo.collateralBalance)) {
    errorMessages.push('depositingAllEthBalance')
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
      errorMessages.push('customCollateralAllowanceAmountEmpty')
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
      errorMessages.push('customDaiAllowanceAmountEmpty')
    }
    if (daiAllowanceAmount?.gt(maxUint256)) {
      errorMessages.push('customDaiAllowanceAmountGreaterThanMaxUint256')
    }
    if (paybackAmount && daiAllowanceAmount && daiAllowanceAmount.lt(paybackAmount)) {
      errorMessages.push('customDaiAllowanceAmountLessThanPaybackAmount')
    }
  }

  return { ...state, errorMessages }
}

export type ManageVaultWarningMessage =
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'debtIsLessThanDebtFloor'
  | 'noProxyAddress'
  | 'insufficientCollateralAllowance'
  | 'insufficientDaiAllowance'
  | 'connectedAccountIsNotVaultController'
  | 'vaultAtRiskLevelDanger'
  | 'vaultAtRiskLevelWarning'
  | 'vaultWillBeAtRiskLevelDanger'
  | 'vaultWillBeAtRiskLevelWarning'
  | 'vaultWillBeAtRiskLevelDangerAtNextPrice'
  | 'vaultWillBeAtRiskLevelWarningAtNextPrice'
  | 'vaultUnderCollateralized'
  | 'depositingAllCollateralBalance'
  | 'payingBackAllVaultDebt'
  | 'payingBackAllDaiBalance'
  | 'withdrawingAllFreeCollateral'
  | 'withdrawringAllFreeCollateralAtNextPrice'
  | ''

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
    vault.collateralizationRatio.lte(vault.collateralizationDangerThreshold)
  ) {
    warningMessages.push('vaultAtRiskLevelDanger')
  }

  if (
    vault.collateralizationRatio.gt(vault.collateralizationDangerThreshold) &&
    vault.collateralizationRatio.lte(vault.collateralizationWarningThreshold)
  ) {
    warningMessages.push('vaultAtRiskLevelWarning')
  }

  if (
    afterCollateralizationRatio.gt(ilkData.liquidationRatio) &&
    afterCollateralizationRatio.lte(vault.collateralizationDangerThreshold)
  ) {
    warningMessages.push('vaultAtRiskLevelDanger')
  }

  if (
    afterCollateralizationRatio.gt(vault.collateralizationDangerThreshold) &&
    afterCollateralizationRatio.lte(vault.collateralizationWarningThreshold)
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
