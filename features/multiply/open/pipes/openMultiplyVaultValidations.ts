import { notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'

import type { OpenMultiplyVaultState } from './openMultiplyVault.types'

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
    insufficientEthFundsForTx,
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
        insufficientEthFundsForTx,
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

export function finalValidation(state: OpenMultiplyVaultState): OpenMultiplyVaultState {
  const {
    token,
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
