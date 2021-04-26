import { maxUint256 } from 'blockchain/calls/erc20'
import { isNullish } from 'helpers/functions'
import { zero } from 'helpers/zero'

import { ManageVaultState } from './manageVault'

export type ManageVaultErrorMessage =
  | 'depositAmountExceedsCollateralBalance'
  | 'withdrawAmountExceedsFreeCollateral'
  | 'withdrawAmountExceedsFreeCollateralAtNextPrice'
  | 'generateAmountExceedsDaiYieldFromTotalCollateral'
  | 'generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice'
  | 'generateAmountExceedsDebtCeiling'
  | 'generateAmountLessThanDebtFloor'
  | 'paybackAmountExceedsDaiBalance'
  | 'paybackAmountExceedsVaultDebt'
  | 'debtWillBeLessThanDebtFloor'
  | 'customCollateralAllowanceAmountEmpty'
  | 'customCollateralAllowanceAmountExceedsMaxUint256'
  | 'customCollateralAllowanceAmountLessThanDepositAmount'
  | 'customDaiAllowanceAmountEmpty'
  | 'customDaiAllowanceAmountExceedsMaxUint256'
  | 'customDaiAllowanceAmountLessThanPaybackAmount'
  | 'depositingAllEthBalance'

export type ManageVaultWarningMessage =
  | 'noProxyAddress'
  | 'insufficientCollateralAllowance'
  | 'insufficientDaiAllowance'
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'debtIsLessThanDebtFloor'
  | 'connectedAccountIsNotVaultController'
  | 'vaultWillBeAtRiskLevelDanger'
  | 'vaultWillBeAtRiskLevelWarning'
  | 'vaultWillBeAtRiskLevelDangerAtNextPrice'
  | 'vaultWillBeAtRiskLevelWarningAtNextPrice'
  | 'vaultAtRiskLevelDanger'
  | 'vaultAtRiskLevelDangerAtNextPrice'
  | 'vaultAtRiskLevelWarning'
  | 'vaultAtRiskLevelWarningAtNextPrice'
  | 'vaultUnderCollateralized'
  | 'vaultUnderCollateralizedAtNextPrice'
  | 'payingBackAllDebt'
  | 'depositingAllCollateralBalance'
  | 'payingBackAllDaiBalance'
  | 'withdrawingAllFreeCollateral'
  | 'withdrawingAllFreeCollateralAtNextPrice'
  | 'generatingAllDaiFromIlkDebtAvailable'
  | 'generatingAllDaiYieldFromTotalCollateral'
  | 'generatingAllDaiYieldFromTotalCollateralAtNextPrice'

export function validateErrors(state: ManageVaultState): ManageVaultState {
  const {
    depositAmount,
    generateAmount,
    paybackAmount,
    stage,
    vault,
    ilkData,
    balanceInfo,

    withdrawAmountExceedsFreeCollateral,
    withdrawAmountExceedsFreeCollateralAtNextPrice,
    generateAmountExceedsDaiYieldFromTotalCollateral,
    generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice,
    generateAmountIsLessThanDebtFloor,
    debtWillBeLessThanDebtFloor,
    isEditingStage,
    customCollateralAllowanceAmountExceedsMaxUint256,
    customCollateralAllowanceAmountLessThanDepositAmount,
    customDaiAllowanceAmountExceedsMaxUint256,
    customDaiAllowanceAmountLessThanPaybackAmount,
  } = state

  const errorMessages: ManageVaultErrorMessage[] = []

  if (isEditingStage) {
    if (depositAmount?.gt(balanceInfo.collateralBalance)) {
      errorMessages.push('depositAmountExceedsCollateralBalance')
    }

    if (withdrawAmountExceedsFreeCollateral) {
      errorMessages.push('withdrawAmountExceedsFreeCollateral')
    }

    if (withdrawAmountExceedsFreeCollateralAtNextPrice) {
      errorMessages.push('withdrawAmountExceedsFreeCollateralAtNextPrice')
    }

    if (generateAmountExceedsDaiYieldFromTotalCollateral) {
      errorMessages.push('generateAmountExceedsDaiYieldFromTotalCollateral')
    }

    if (generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice) {
      errorMessages.push('generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice')
    }

    if (generateAmount?.gt(ilkData.ilkDebtAvailable)) {
      errorMessages.push('generateAmountExceedsDebtCeiling')
    }

    if (generateAmountIsLessThanDebtFloor) {
      errorMessages.push('generateAmountLessThanDebtFloor')
    }

    if (paybackAmount?.gt(balanceInfo.daiBalance)) {
      errorMessages.push('paybackAmountExceedsDaiBalance')
    }

    if (paybackAmount?.gt(vault.debt)) {
      errorMessages.push('paybackAmountExceedsVaultDebt')
    }

    if (vault.token === 'ETH' && depositAmount?.eq(balanceInfo.collateralBalance)) {
      errorMessages.push('depositingAllEthBalance')
    }

    if (debtWillBeLessThanDebtFloor) {
      errorMessages.push('debtWillBeLessThanDebtFloor')
    }
  }

  if (stage === 'collateralAllowanceWaitingForConfirmation') {
    if (customCollateralAllowanceAmountExceedsMaxUint256) {
      errorMessages.push('customCollateralAllowanceAmountExceedsMaxUint256')
    }
    if (customCollateralAllowanceAmountLessThanDepositAmount) {
      errorMessages.push('customCollateralAllowanceAmountLessThanDepositAmount')
    }
  }

  if (stage === 'daiAllowanceWaitingForConfirmation') {
    if (customDaiAllowanceAmountExceedsMaxUint256) {
      errorMessages.push('customDaiAllowanceAmountExceedsMaxUint256')
    }
    if (customDaiAllowanceAmountLessThanPaybackAmount) {
      errorMessages.push('customDaiAllowanceAmountLessThanPaybackAmount')
    }
  }

  return { ...state, errorMessages }
}

export function validateWarnings(state: ManageVaultState): ManageVaultState {
  const {
    depositAmount,
    generateAmount,
    paybackAmount,
    withdrawAmount,
    proxyAddress,
    collateralAllowance,
    daiAllowance,
    accountIsController,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    shouldPaybackAll,
    daiYieldFromTotalCollateral,
    vault,
    ilkData,
    balanceInfo,
    maxGenerateAmountCurrentPrice,
    maxGenerateAmountNextPrice,
    errorMessages,
    stage,
    inputAmountsEmpty,
  } = state

  const warningMessages: ManageVaultWarningMessage[] = []

  if (errorMessages.length) return { ...state, warningMessages }

  if (stage === 'collateralEditing' || stage === 'daiEditing') {
    if (
      depositAmount &&
      !depositAmount.isZero() &&
      daiYieldFromTotalCollateral.lt(ilkData.debtFloor)
    ) {
      warningMessages.push('potentialGenerateAmountLessThanDebtFloor')
    }

    if (vault.token !== 'ETH') {
      if (
        depositAmount &&
        !depositAmount.isZero() &&
        (!collateralAllowance || depositAmount?.gt(collateralAllowance))
      ) {
        warningMessages.push('insufficientCollateralAllowance')
      }
    }

    if (
      paybackAmount &&
      !paybackAmount.isZero() &&
      (!daiAllowance || paybackAmount?.gt(daiAllowance))
    ) {
      warningMessages.push('insufficientDaiAllowance')
    }

    if (vault.debt.lt(ilkData.debtFloor) && vault.debt.gt(zero)) {
      warningMessages.push('debtIsLessThanDebtFloor')
    }

    const vaultWillBeAtRiskLevelDanger =
      !inputAmountsEmpty &&
      afterCollateralizationRatio.gte(ilkData.liquidationRatio) &&
      afterCollateralizationRatio.lte(ilkData.collateralizationDangerThreshold)

    if (vaultWillBeAtRiskLevelDanger) {
      warningMessages.push('vaultWillBeAtRiskLevelDanger')
    }

    const vaultWillBeAtRiskLevelDangerAtNextPrice =
      !inputAmountsEmpty &&
      afterCollateralizationRatioAtNextPrice.gte(ilkData.liquidationRatio) &&
      afterCollateralizationRatioAtNextPrice.lte(ilkData.collateralizationDangerThreshold)

    if (!vaultWillBeAtRiskLevelDanger && vaultWillBeAtRiskLevelDangerAtNextPrice) {
      warningMessages.push('vaultWillBeAtRiskLevelDangerAtNextPrice')
    }

    const vaultWillBeAtRiskLevelWarning =
      !inputAmountsEmpty &&
      afterCollateralizationRatio.gt(ilkData.collateralizationDangerThreshold) &&
      afterCollateralizationRatio.lte(ilkData.collateralizationWarningThreshold)

    if (!vaultWillBeAtRiskLevelDangerAtNextPrice && vaultWillBeAtRiskLevelWarning) {
      warningMessages.push('vaultWillBeAtRiskLevelWarning')
    }

    const vaultWillBeAtRiskLevelWarningNextPrice =
      !inputAmountsEmpty &&
      afterCollateralizationRatioAtNextPrice.gt(ilkData.collateralizationDangerThreshold) &&
      afterCollateralizationRatioAtNextPrice.lte(ilkData.collateralizationWarningThreshold)

    if (
      !vaultWillBeAtRiskLevelDanger &&
      !vaultWillBeAtRiskLevelWarning &&
      !vaultWillBeAtRiskLevelDangerAtNextPrice &&
      vaultWillBeAtRiskLevelWarningNextPrice
    ) {
      warningMessages.push('vaultWillBeAtRiskLevelWarningAtNextPrice')
    }

    if (shouldPaybackAll) {
      warningMessages.push('payingBackAllDebt')
    }

    if (depositAmount?.eq(balanceInfo.collateralBalance)) {
      warningMessages.push('depositingAllCollateralBalance')
    }

    if (paybackAmount?.eq(balanceInfo.daiBalance)) {
      warningMessages.push('payingBackAllDaiBalance')
    }

    if (withdrawAmount?.eq(vault.freeCollateral)) {
      warningMessages.push('withdrawingAllFreeCollateral')
    }

    if (
      withdrawAmount?.eq(vault.freeCollateralAtNextPrice) &&
      vault.freeCollateralAtNextPrice.lt(vault.freeCollateral)
    ) {
      warningMessages.push('withdrawingAllFreeCollateralAtNextPrice')
    }

    if (
      !ilkData.ilkDebtAvailable.isZero() &&
      generateAmount?.eq(ilkData.ilkDebtAvailable) &&
      maxGenerateAmountCurrentPrice.eq(ilkData.ilkDebtAvailable)
    ) {
      warningMessages.push('generatingAllDaiFromIlkDebtAvailable')
    }

    const generatingAllDaiYieldFromTotalCollateral =
      generateAmount?.eq(maxGenerateAmountCurrentPrice) &&
      !maxGenerateAmountCurrentPrice.eq(ilkData.ilkDebtAvailable)
    if (generatingAllDaiYieldFromTotalCollateral) {
      warningMessages.push('generatingAllDaiYieldFromTotalCollateral')
    }

    if (
      !generatingAllDaiYieldFromTotalCollateral &&
      generateAmount?.eq(maxGenerateAmountNextPrice) &&
      !maxGenerateAmountNextPrice.eq(ilkData.ilkDebtAvailable)
    ) {
      warningMessages.push('generatingAllDaiYieldFromTotalCollateralAtNextPrice')
    }
  }
  return { ...state, warningMessages }
}
