import { errorMessagesHandler, VaultErrorMessage } from '../form/errorMessagesHandler'
import { VaultWarningMessage, warningMessagesHandler } from '../form/warningMessagesHandler'
import { OpenMultiplyVaultState } from './openMultiplyVault'

export function validateErrors(state: OpenMultiplyVaultState): OpenMultiplyVaultState {
  const {
    stage,
    isEditingStage,
    depositingAllEthBalance,
    generateAmountExceedsDaiYieldFromDepositingCollateral,
    generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice,
    generateAmountExceedsDebtCeiling,
    generateAmountMoreThanMaxFlashAmount,
    generateAmountLessThanDebtFloor,
    customAllowanceAmountExceedsMaxUint256,
    customAllowanceAmountLessThanDepositAmount,
    depositAmountExceedsCollateralBalance,
    ledgerWalletContractDataDisabled,
    exchangeError,
  } = state
  const errorMessages: VaultErrorMessage[] = []

  if (isEditingStage) {
    errorMessages.push(
      ...errorMessagesHandler({
        depositAmountExceedsCollateralBalance,
        depositingAllEthBalance,
        generateAmountExceedsDaiYieldFromDepositingCollateral,
        generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice,
        generateAmountExceedsDebtCeiling,
        generateAmountLessThanDebtFloor,
        exchangeError,
        generateAmountMoreThanMaxFlashAmount,
      }),
    )
  }

  if (stage === 'allowanceWaitingForConfirmation') {
    errorMessages.push(
      ...errorMessagesHandler({
        customAllowanceAmountExceedsMaxUint256,
        customAllowanceAmountLessThanDepositAmount,
      }),
    )
  }

  if (stage === 'txFailure' || stage === 'proxyFailure' || stage === 'allowanceFailure') {
    errorMessages.push(
      ...errorMessagesHandler({
        ledgerWalletContractDataDisabled,
      }),
    )
  }

  return { ...state, errorMessages }
}

export function validateWarnings(state: OpenMultiplyVaultState): OpenMultiplyVaultState {
  const {
    errorMessages,
    isEditingStage,
    vaultWillBeAtRiskLevelDanger,
    vaultWillBeAtRiskLevelDangerAtNextPrice,
    vaultWillBeAtRiskLevelWarning,
    vaultWillBeAtRiskLevelWarningAtNextPrice,
    potentialGenerateAmountLessThanDebtFloor,
    highSlippage,
  } = state

  const warningMessages: VaultWarningMessage[] = []

  if (errorMessages.length) return { ...state, warningMessages }

  if (isEditingStage) {
    warningMessages.push(
      ...warningMessagesHandler({
        potentialGenerateAmountLessThanDebtFloor,
        vaultWillBeAtRiskLevelDanger,
        vaultWillBeAtRiskLevelDangerAtNextPrice,
        vaultWillBeAtRiskLevelWarning,
        vaultWillBeAtRiskLevelWarningAtNextPrice,
        highSlippage,
      }),
    )
  }
  return { ...state, warningMessages }
}
