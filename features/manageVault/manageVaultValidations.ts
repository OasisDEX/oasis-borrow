import { isNullish } from 'helpers/functions'
import { zero } from 'helpers/zero'

import { errorMessagesHandler } from '../form/errorMessagesHandler'
import { VaultErrorMessage } from '../openMultiplyVault/openMultiplyVaultValidations'
import { ManageVaultState } from './manageVault'

export type ManageVaultWarningMessage =
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'debtIsLessThanDebtFloor'
  | 'vaultWillBeAtRiskLevelDanger'
  | 'vaultWillBeAtRiskLevelWarning'
  | 'vaultWillBeAtRiskLevelDangerAtNextPrice'
  | 'vaultWillBeAtRiskLevelWarningAtNextPrice'

export function validateErrors(state: ManageVaultState): ManageVaultState {
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
    depositCollateralOnVaultUnderDebtFloor,
    ledgerWalletContractDataDisabled,
  } = state

  const errorMessages: VaultErrorMessage[] = []

  if (isEditingStage) {
    errorMessages.push(
      ...errorMessagesHandler({
        depositAmountExceedsCollateralBalance,
        withdrawAmountExceedsFreeCollateral,
        withdrawAmountExceedsFreeCollateralAtNextPrice,
        generateAmountExceedsDaiYieldFromTotalCollateral,
        generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice,
        generateAmountExceedsDebtCeiling,
        generateAmountLessThanDebtFloor,
        paybackAmountExceedsDaiBalance,
        paybackAmountExceedsVaultDebt,
        depositingAllEthBalance,
        debtWillBeLessThanDebtFloor,
        withdrawCollateralOnVaultUnderDebtFloor,
        depositCollateralOnVaultUnderDebtFloor,
      }),
    )
  }

  if (stage === 'collateralAllowanceWaitingForConfirmation') {
    errorMessages.push(
      ...errorMessagesHandler({
        customCollateralAllowanceAmountExceedsMaxUint256,
        customCollateralAllowanceAmountLessThanDepositAmount,
      }),
    )
  }

  if (stage === 'daiAllowanceWaitingForConfirmation') {
    errorMessages.push(
      ...errorMessagesHandler({
        customDaiAllowanceAmountExceedsMaxUint256,
        customDaiAllowanceAmountLessThanPaybackAmount,
      }),
    )
  }

  if (
    stage === 'manageFailure' ||
    stage === 'proxyFailure' ||
    stage === 'daiAllowanceFailure' ||
    stage === 'collateralAllowanceFailure'
  ) {
    errorMessages.push(
      ...errorMessagesHandler({
        ledgerWalletContractDataDisabled,
      }),
    )
  }

  return { ...state, errorMessages }
}

export function validateWarnings(state: ManageVaultState): ManageVaultState {
  const {
    depositAmount,
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
