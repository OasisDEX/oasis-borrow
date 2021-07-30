import { isNullish } from 'helpers/functions'
import { zero } from 'helpers/zero'

import { ManageMultiplyVaultState } from './manageMultiplyVault'

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
  | 'customCollateralAllowanceAmountExceedsMaxUint256'
  | 'customCollateralAllowanceAmountLessThanDepositAmount'
  | 'customDaiAllowanceAmountExceedsMaxUint256'
  | 'customDaiAllowanceAmountLessThanPaybackAmount'
  | 'depositingAllEthBalance'
  | 'ledgerWalletContractDataDisabled'
  | 'withdrawCollateralOnVaultUnderDebtFloor'

export type ManageVaultWarningMessage =
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'debtIsLessThanDebtFloor'
  | 'vaultWillBeAtRiskLevelDanger'
  | 'vaultWillBeAtRiskLevelWarning'
  | 'vaultWillBeAtRiskLevelDangerAtNextPrice'
  | 'vaultWillBeAtRiskLevelWarningAtNextPrice'

export function validateErrors(state: ManageMultiplyVaultState): ManageMultiplyVaultState {
  const {
    stage,
    withdrawAmountExceedsFreeCollateral,
    withdrawAmountExceedsFreeCollateralAtNextPrice,
    generateAmountExceedsDaiYieldFromTotalCollateral,
    generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice,
    generateAmountLessThanDebtFloor,
    debtWillBeLessThanDebtFloor,
    isEditingStage,
    customCollateralAllowanceAmountExceedsMaxUint256,
    customCollateralAllowanceAmountLessThanDepositAmount,
    customDaiAllowanceAmountExceedsMaxUint256,
    customDaiAllowanceAmountLessThanPaybackAmount,
    depositAmountExceedsCollateralBalance,
    depositingAllEthBalance,
    generateAmountExceedsDebtCeiling,
    paybackAmountExceedsDaiBalance,
    paybackAmountExceedsVaultDebt,
    withdrawCollateralOnVaultUnderDebtFloor,
  } = state

  const errorMessages: ManageVaultErrorMessage[] = []

  if (isEditingStage) {
    if (depositAmountExceedsCollateralBalance) {
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

    if (generateAmountExceedsDebtCeiling) {
      errorMessages.push('generateAmountExceedsDebtCeiling')
    }

    if (generateAmountLessThanDebtFloor) {
      errorMessages.push('generateAmountLessThanDebtFloor')
    }

    if (paybackAmountExceedsDaiBalance) {
      errorMessages.push('paybackAmountExceedsDaiBalance')
    }

    if (paybackAmountExceedsVaultDebt) {
      errorMessages.push('paybackAmountExceedsVaultDebt')
    }

    if (depositingAllEthBalance) {
      errorMessages.push('depositingAllEthBalance')
    }

    if (debtWillBeLessThanDebtFloor) {
      errorMessages.push('debtWillBeLessThanDebtFloor')
    }

    if (withdrawCollateralOnVaultUnderDebtFloor) {
      errorMessages.push('withdrawCollateralOnVaultUnderDebtFloor')
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

  if (
    stage === 'manageFailure' ||
    stage === 'proxyFailure' ||
    stage === 'daiAllowanceFailure' ||
    stage === 'collateralAllowanceFailure'
  ) {
    if (state.txError?.name === 'EthAppPleaseEnableContractData') {
      errorMessages.push('ledgerWalletContractDataDisabled')
    }
  }

  return { ...state, errorMessages }
}

export function validateWarnings(state: ManageMultiplyVaultState): ManageMultiplyVaultState {
  const {
    vault,
    ilkData,
    errorMessages,
    isEditingStage,
    vaultWillBeAtRiskLevelDanger,
    vaultWillBeAtRiskLevelDangerAtNextPrice,
    vaultWillBeAtRiskLevelWarning,
    vaultWillBeAtRiskLevelWarningAtNextPrice,
    maxGenerateAmountAtCurrentPrice,
  } = state
  //TODO
  const depositAmount = zero

  const warningMessages: ManageVaultWarningMessage[] = []

  if (errorMessages.length) return { ...state, warningMessages }

  if (isEditingStage) {
    if (!isNullish(depositAmount) && maxGenerateAmountAtCurrentPrice.lt(ilkData.debtFloor)) {
      warningMessages.push('potentialGenerateAmountLessThanDebtFloor')
    }

    if (vault.debt.lt(ilkData.debtFloor) && vault.debt.gt(zero)) {
      warningMessages.push('debtIsLessThanDebtFloor')
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
