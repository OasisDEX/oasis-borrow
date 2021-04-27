import { maxUint256 } from 'blockchain/calls/erc20'
import { isNullish } from 'helpers/functions'
import { zero } from 'helpers/zero'

import { OpenVaultState } from './openVault'

export type OpenVaultErrorMessage =
  | 'vaultWillBeUnderCollateralized'
  | 'vaultWillBeUnderCollateralizedAtNextPrice'
  | 'depositAmountExceedsCollateralBalance'
  | 'depositingAllEthBalance'
  | 'generateAmountExceedsDaiYieldFromDepositingCollateral'
  | 'generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice'
  | 'generateAmountExceedsDebtCeiling'
  | 'generateAmountLessThanDebtFloor'
  | 'customAllowanceAmountEmpty'
  | 'customAllowanceAmountGreaterThanMaxUint256'
  | 'customAllowanceAmountLessThanDepositAmount'

export function validateErrors(state: OpenVaultState): OpenVaultState {
  const {
    depositAmount,
    balanceInfo,
    stage,
    allowanceAmount,
    isEditingStage,
    vaultWillBeUnderCollateralized,
    vaultWillBeUnderCollateralizedAtNextPrice,
    depositingAllEthBalance,
    generateAmountExceedsDaiYieldFromDepositingCollateral,
    generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice,
    generateAmountExceedsDebtCeiling,
    generateAmountLessThanDebtFloor,
  } = state
  const errorMessages: OpenVaultErrorMessage[] = []

  if (isEditingStage) {
    if (depositAmount?.gt(balanceInfo.collateralBalance)) {
      errorMessages.push('depositAmountExceedsCollateralBalance')
    }

    if (depositingAllEthBalance) {
      errorMessages.push('depositingAllEthBalance')
    }

    if (generateAmountExceedsDaiYieldFromDepositingCollateral) {
      errorMessages.push('generateAmountExceedsDaiYieldFromDepositingCollateral')
    }

    if (generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice) {
      errorMessages.push('generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice')
    }

    if (generateAmountExceedsDebtCeiling) {
      errorMessages.push('generateAmountExceedsDebtCeiling')
    }

    if (generateAmountLessThanDebtFloor) {
      errorMessages.push('generateAmountLessThanDebtFloor')
    }
  }

  if (stage === 'allowanceWaitingForConfirmation') {
    if (!allowanceAmount) {
      errorMessages.push('customAllowanceAmountEmpty')
    }
    if (allowanceAmount?.gt(maxUint256)) {
      errorMessages.push('customAllowanceAmountGreaterThanMaxUint256')
    }
    if (depositAmount && allowanceAmount && allowanceAmount.lt(depositAmount)) {
      errorMessages.push('customAllowanceAmountLessThanDepositAmount')
    }
  }

  return { ...state, errorMessages }
}

export type OpenVaultWarningMessage =
  | 'openingEmptyVault'
  | 'openingVaultWithCollateralOnly'
  | 'openingVaultWithCollateralAndDebt'
  | 'noProxyAddress'
  | 'insufficientAllowance'
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'vaultWillBeAtRiskLevelDanger'
  | 'vaultWillBeAtRiskLevelWarning'
  | 'vaultWillBeAtRiskLevelDangerAtNextPrice'
  | 'vaultWillBeAtRiskLevelWarningAtNextPrice'
  | 'depositingAllCollateralBalance'
  | 'generatingAllDaiFromIlkDebtAvailable'
  | 'generatingAllDaiYieldFromDepositingCollateral'
  | 'generatingAllDaiYieldFromDepositingCollateralAtNextPrice'

export function validateWarnings(state: OpenVaultState): OpenVaultState {
  const {
    depositAmount,
    generateAmount,
    errorMessages,
    proxyAddress,
    allowance,
    daiYieldFromDepositingCollateral,
    ilkData,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    balanceInfo,
    maxGenerateAmountCurrentPrice,
    maxGenerateAmountNextPrice,
    stage,
  } = state

  const warningMessages: OpenVaultWarningMessage[] = []

  if (errorMessages.length) return { ...state, warningMessages }

  if (stage === 'editing') {
    if (isNullish(depositAmount) && isNullish(generateAmount)) {
      warningMessages.push('openingEmptyVault')
    }

    if (!isNullish(depositAmount) && isNullish(generateAmount)) {
      warningMessages.push('openingVaultWithCollateralOnly')
    }

    if (!isNullish(depositAmount) && !isNullish(generateAmount)) {
      warningMessages.push('openingVaultWithCollateralAndDebt')
    }

    if (!proxyAddress) {
      warningMessages.push('noProxyAddress')
    }

    if (depositAmount && !depositAmount.isZero() && (!allowance || depositAmount.gt(allowance))) {
      warningMessages.push('insufficientAllowance')
    }

    if (
      depositAmount &&
      !depositAmount.isZero() &&
      daiYieldFromDepositingCollateral.lt(ilkData.debtFloor)
    ) {
      warningMessages.push('potentialGenerateAmountLessThanDebtFloor')
    }

    const inputFieldsAreEmpty = isNullish(depositAmount) && isNullish(generateAmount)

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

    if (depositAmount?.eq(balanceInfo.collateralBalance)) {
      warningMessages.push('depositingAllCollateralBalance')
    }

    if (
      !ilkData.ilkDebtAvailable.isZero() &&
      generateAmount?.eq(ilkData.ilkDebtAvailable) &&
      maxGenerateAmountCurrentPrice.eq(ilkData.ilkDebtAvailable)
    ) {
      warningMessages.push('generatingAllDaiFromIlkDebtAvailable')
    }

    const generatingAllDaiYieldFromDepositingCollateral =
      generateAmount?.eq(maxGenerateAmountCurrentPrice) &&
      !maxGenerateAmountCurrentPrice.eq(ilkData.ilkDebtAvailable)
    if (generatingAllDaiYieldFromDepositingCollateral) {
      warningMessages.push('generatingAllDaiYieldFromDepositingCollateral')
    }

    if (
      !generatingAllDaiYieldFromDepositingCollateral &&
      generateAmount?.eq(maxGenerateAmountNextPrice) &&
      !maxGenerateAmountNextPrice.eq(ilkData.ilkDebtAvailable)
    ) {
      warningMessages.push('generatingAllDaiYieldFromDepositingCollateralAtNextPrice')
    }
  }
  return { ...state, warningMessages }
}
