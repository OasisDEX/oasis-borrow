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
  | 'paybackAmountCausesVaultDebtToBeLessThanDebtFloor'
  | 'customCollateralAllowanceAmountEmpty'
  | 'customCollateralAllowanceAmountGreaterThanMaxUint256'
  | 'customCollateralAllowanceAmountLessThanDepositAmount'
  | 'customDaiAllowanceAmountEmpty'
  | 'customDaiAllowanceAmountGreaterThanMaxUint256'
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
    withdrawAmount,
    stage,
    collateralAllowanceAmount,
    daiAllowanceAmount,
    shouldPaybackAll,
    daiYieldFromTotalCollateral,
    daiYieldFromTotalCollateralAtNextPrice,
    vault,
    ilkData,
    balanceInfo,
  } = state

  const errorMessages: ManageVaultErrorMessage[] = []

  if (stage === 'collateralEditing' || stage === 'daiEditing') {
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

    if (generateAmount?.gt(ilkData.ilkDebtAvailable)) {
      errorMessages.push('generateAmountExceedsDebtCeiling')
    }

    if (
      generateAmount &&
      !generateAmount.plus(vault.debt).isZero() &&
      generateAmount.plus(vault.debt).lt(ilkData.debtFloor)
    ) {
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

    if (
      paybackAmount &&
      vault.debt.minus(paybackAmount).lt(ilkData.debtFloor) &&
      vault.debt.minus(paybackAmount).gt(zero) &&
      !shouldPaybackAll
    ) {
      errorMessages.push('paybackAmountCausesVaultDebtToBeLessThanDebtFloor')
    }
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

    if (!proxyAddress) {
      warningMessages.push('noProxyAddress')
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

    // review
    const inputFieldsAreEmpty = [
      depositAmount,
      generateAmount,
      withdrawAmount,
      paybackAmount,
    ].every((amount) => isNullish(amount))

    const vaultWillBeAtRiskLevelDanger =
      !inputFieldsAreEmpty &&
      afterCollateralizationRatio.gte(ilkData.liquidationRatio) &&
      afterCollateralizationRatio.lte(ilkData.collateralizationDangerThreshold)

    if (vaultWillBeAtRiskLevelDanger) {
      warningMessages.push('vaultWillBeAtRiskLevelDanger')
    }

    const vaultWillBeAtRiskLevelDangerAtNextPrice =
      !inputFieldsAreEmpty &&
      afterCollateralizationRatioAtNextPrice.gte(ilkData.liquidationRatio) &&
      afterCollateralizationRatioAtNextPrice.lte(ilkData.collateralizationDangerThreshold)

    if (!vaultWillBeAtRiskLevelDanger && vaultWillBeAtRiskLevelDangerAtNextPrice) {
      warningMessages.push('vaultWillBeAtRiskLevelDangerAtNextPrice')
    }

    const vaultWillBeAtRiskLevelWarning =
      !inputFieldsAreEmpty &&
      afterCollateralizationRatio.gt(ilkData.collateralizationDangerThreshold) &&
      afterCollateralizationRatio.lte(ilkData.collateralizationWarningThreshold)

    if (!vaultWillBeAtRiskLevelDangerAtNextPrice && vaultWillBeAtRiskLevelWarning) {
      warningMessages.push('vaultWillBeAtRiskLevelWarning')
    }

    const vaultWillBeAtRiskLevelWarningNextPrice =
      !inputFieldsAreEmpty &&
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

    const isShowingAfterCollateralizationNotice =
      vaultWillBeAtRiskLevelDanger ||
      vaultWillBeAtRiskLevelDangerAtNextPrice ||
      vaultWillBeAtRiskLevelWarning ||
      vaultWillBeAtRiskLevelWarningNextPrice

    if (!isShowingAfterCollateralizationNotice) {
      const vaultAtRiskLevelDanger =
        vault.collateralizationRatio.gte(ilkData.liquidationRatio) &&
        vault.collateralizationRatio.lte(ilkData.collateralizationDangerThreshold)

      if (vaultAtRiskLevelDanger) {
        warningMessages.push('vaultAtRiskLevelDanger')
      }

      const vaultAtRiskLevelDangerAtNextPrice =
        vault.collateralizationRatioAtNextPrice.gte(ilkData.liquidationRatio) &&
        vault.collateralizationRatioAtNextPrice.lte(ilkData.collateralizationDangerThreshold)

      if (!vaultAtRiskLevelDanger && vaultAtRiskLevelDangerAtNextPrice) {
        warningMessages.push('vaultAtRiskLevelDangerAtNextPrice')
      }

      const vaultAtRiskLevelWarning =
        vault.collateralizationRatio.gt(ilkData.collateralizationDangerThreshold) &&
        vault.collateralizationRatio.lte(ilkData.collateralizationWarningThreshold)

      if (!vaultAtRiskLevelDangerAtNextPrice && vaultAtRiskLevelWarning) {
        warningMessages.push('vaultAtRiskLevelWarning')
      }

      const vaultAtRiskLevelWarningAtNextPrice =
        vault.collateralizationRatioAtNextPrice.gt(ilkData.collateralizationDangerThreshold) &&
        vault.collateralizationRatioAtNextPrice.lte(ilkData.collateralizationWarningThreshold)

      if (
        !vaultAtRiskLevelDanger &&
        !vaultAtRiskLevelWarning &&
        !vaultAtRiskLevelDangerAtNextPrice &&
        vaultAtRiskLevelWarningAtNextPrice
      ) {
        warningMessages.push('vaultAtRiskLevelWarningAtNextPrice')
      }
    }

    const vaultUnderCollateralized =
      vault.collateralizationRatio.lt(ilkData.liquidationRatio) &&
      !vault.collateralizationRatio.isZero()

    if (vaultUnderCollateralized) {
      warningMessages.push('vaultUnderCollateralized')
    }

    const vaultUnderCollateralizedAtNextPrice =
      vault.collateralizationRatioAtNextPrice.lt(ilkData.liquidationRatio) &&
      !vault.collateralizationRatioAtNextPrice.isZero()

    if (!vaultUnderCollateralized && vaultUnderCollateralizedAtNextPrice) {
      warningMessages.push('vaultUnderCollateralizedAtNextPrice')
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
