import { notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'

import type { ManageStandardBorrowVaultState } from './manageVault.types'

export function validateErrors(
  state: ManageStandardBorrowVaultState,
): ManageStandardBorrowVaultState {
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
    afterCollRatioBelowStopLossRatio,
    afterCollRatioBelowAutoSellRatio,
    afterCollRatioAboveAutoBuyRatio,
    afterCollRatioBelowConstantMultipleSellRatio,
    afterCollRatioAboveConstantMultipleBuyRatio,
    insufficientEthFundsForTx,
    takeProfitWillTriggerImmediatelyAfterVaultReopen,
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
        afterCollRatioBelowStopLossRatio,
        afterCollRatioBelowAutoSellRatio,
        afterCollRatioAboveAutoBuyRatio,
        afterCollRatioBelowConstantMultipleSellRatio,
        afterCollRatioAboveConstantMultipleBuyRatio,
        takeProfitWillTriggerImmediatelyAfterVaultReopen,
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
        insufficientEthFundsForTx,
      }),
    )
  }

  return { ...state, errorMessages }
}

export function validateWarnings(
  state: ManageStandardBorrowVaultState,
): ManageStandardBorrowVaultState {
  const {
    errorMessages,
    isEditingStage,
    vaultWillBeAtRiskLevelDanger,
    vaultWillBeAtRiskLevelDangerAtNextPrice,
    vaultWillBeAtRiskLevelWarning,
    vaultWillBeAtRiskLevelWarningAtNextPrice,
    debtIsLessThanDebtFloor,
    potentialGenerateAmountLessThanDebtFloor,
    existingTakeProfitTriggerAfterVaultReopen,
  } = state

  const warningMessages: VaultWarningMessage[] = []

  if (errorMessages.length) return { ...state, warningMessages }

  if (isEditingStage) {
    warningMessages.push(
      ...warningMessagesHandler({
        potentialGenerateAmountLessThanDebtFloor,
        debtIsLessThanDebtFloor,
        vaultWillBeAtRiskLevelDanger,
        vaultWillBeAtRiskLevelDangerAtNextPrice,
        vaultWillBeAtRiskLevelWarning,
        vaultWillBeAtRiskLevelWarningAtNextPrice,
        existingTakeProfitTriggerAfterVaultReopen,
      }),
    )
  }
  return { ...state, warningMessages }
}

export function finalValidation(
  state: ManageStandardBorrowVaultState,
): ManageStandardBorrowVaultState {
  const {
    vault: { token },
    gasEstimationUsd,
    balanceInfo: { ethBalance },
    priceInfo: { currentEthPrice },
    depositAmount,
    isEditingStage,
    isProxyStage,
  } = state

  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token,
    gasEstimationUsd,
    ethBalance,
    ethPrice: currentEthPrice,
    depositAmount,
  })

  const warningMessages: VaultWarningMessage[] = [...state.warningMessages]

  if (isEditingStage || isProxyStage) {
    warningMessages.push(
      ...warningMessagesHandler({
        potentialInsufficientEthFundsForTx,
      }),
    )
  }

  return { ...state, warningMessages }
}
