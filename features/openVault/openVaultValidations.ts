import { isNullish } from 'helpers/functions'

import { OpenVaultState } from './openVault'

export type OpenVaultErrorMessage =
  | 'depositAmountExceedsCollateralBalance'
  | 'depositingAllEthBalance'
  | 'generateAmountExceedsDaiYieldFromDepositingCollateral'
  | 'generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice'
  | 'generateAmountExceedsDebtCeiling'
  | 'generateAmountLessThanDebtFloor'
  | 'customAllowanceAmountExceedsMaxUint256'
  | 'customAllowanceAmountLessThanDepositAmount'

export function validateErrors(state: OpenVaultState): OpenVaultState {
  const {
    depositAmount,
    balanceInfo,
    stage,
    isEditingStage,
    depositingAllEthBalance,
    generateAmountExceedsDaiYieldFromDepositingCollateral,
    generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice,
    generateAmountExceedsDebtCeiling,
    generateAmountLessThanDebtFloor,
    customAllowanceAmountExceedsMaxUint256,
    customAllowanceAmountLessThanDepositAmount,
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
    if (customAllowanceAmountExceedsMaxUint256) {
      errorMessages.push('customAllowanceAmountExceedsMaxUint256')
    }
    if (customAllowanceAmountLessThanDepositAmount) {
      errorMessages.push('customAllowanceAmountLessThanDepositAmount')
    }
  }

  return { ...state, errorMessages }
}

export type OpenVaultWarningMessage =
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'vaultWillBeAtRiskLevelDanger'
  | 'vaultWillBeAtRiskLevelWarning'
  | 'vaultWillBeAtRiskLevelDangerAtNextPrice'
  | 'vaultWillBeAtRiskLevelWarningAtNextPrice'

export function validateWarnings(state: OpenVaultState): OpenVaultState {
  const {
    depositAmount,
    errorMessages,
    daiYieldFromDepositingCollateral,
    ilkData,
    isEditingStage,
    vaultWillBeAtRiskLevelDanger,
    vaultWillBeAtRiskLevelDangerAtNextPrice,
    vaultWillBeAtRiskLevelWarning,
    vaultWillBeAtRiskLevelWarningAtNextPrice,
  } = state

  const warningMessages: OpenVaultWarningMessage[] = []

  if (errorMessages.length) return { ...state, warningMessages }

  if (isEditingStage) {
    if (!isNullish(depositAmount) && daiYieldFromDepositingCollateral.lt(ilkData.debtFloor)) {
      warningMessages.push('potentialGenerateAmountLessThanDebtFloor')
    }

    if (vaultWillBeAtRiskLevelDanger) {
      warningMessages.push('vaultWillBeAtRiskLevelDanger')
    }

    if (vaultWillBeAtRiskLevelDangerAtNextPrice) {
      warningMessages.push('vaultWillBeAtRiskLevelDangerAtNextPrice')
    }

    if (vaultWillBeAtRiskLevelWarning) {
      warningMessages.push('vaultWillBeAtRiskLevelWarning')
    }

    if (vaultWillBeAtRiskLevelWarningAtNextPrice) {
      warningMessages.push('vaultWillBeAtRiskLevelWarningAtNextPrice')
    }
  }
  return { ...state, warningMessages }
}
