import { notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'

import type { ManageMultiplyVaultState } from './ManageMultiplyVaultState.types'

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
    depositDaiAmountExceedsDaiBalance,
    depositingAllEthBalance,
    generateAmountExceedsDebtCeiling,
    generateAmountMoreThanMaxFlashAmount,
    paybackAmountExceedsDaiBalance,
    paybackAmountExceedsVaultDebt,
    withdrawCollateralOnVaultUnderDebtFloor,
    hasToDepositCollateralOnEmptyVault,
    shouldShowExchangeError,
    ledgerWalletContractDataDisabled,
    invalidSlippage,
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
        depositDaiAmountExceedsDaiBalance,
        withdrawAmountExceedsFreeCollateral,
        withdrawAmountExceedsFreeCollateralAtNextPrice,
        generateAmountExceedsDaiYieldFromTotalCollateral,
        generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice,
        generateAmountMoreThanMaxFlashAmount,
        generateAmountExceedsDebtCeiling,
        generateAmountLessThanDebtFloor,
        paybackAmountExceedsDaiBalance,
        paybackAmountExceedsVaultDebt,
        depositingAllEthBalance,
        debtWillBeLessThanDebtFloor,
        withdrawCollateralOnVaultUnderDebtFloor,
        hasToDepositCollateralOnEmptyVault,
        shouldShowExchangeError,
        invalidSlippage,
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

export function validateWarnings(state: ManageMultiplyVaultState): ManageMultiplyVaultState {
  const {
    errorMessages,
    isEditingStage,
    potentialGenerateAmountLessThanDebtFloor,
    debtIsLessThanDebtFloor,
    vaultWillBeAtRiskLevelDanger,
    vaultWillBeAtRiskLevelDangerAtNextPrice,
    vaultWillBeAtRiskLevelWarning,
    vaultWillBeAtRiskLevelWarningAtNextPrice,
    highSlippage,
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
        highSlippage,
        existingTakeProfitTriggerAfterVaultReopen,
      }),
    )
  }
  return { ...state, warningMessages }
}

export function finalValidation(state: ManageMultiplyVaultState): ManageMultiplyVaultState {
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
