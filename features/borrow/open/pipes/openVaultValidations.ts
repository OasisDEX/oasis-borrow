import { notEnoughETHtoPayForTx } from '../../../form/commonValidators'
import { errorMessagesHandler, VaultErrorMessage } from '../../../form/errorMessagesHandler'
import { VaultWarningMessage, warningMessagesHandler } from '../../../form/warningMessagesHandler'
import { OpenVaultState } from './openVault'

export function validateErrors(state: OpenVaultState): OpenVaultState {
  const {
    stage,
    isEditingStage,
    depositingAllEthBalance,
    generateAmountExceedsDaiYieldFromDepositingCollateral,
    generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice,
    generateAmountExceedsDebtCeiling,
    generateAmountLessThanDebtFloor,
    customAllowanceAmountExceedsMaxUint256,
    customAllowanceAmountLessThanDepositAmount,
    depositAmountExceedsCollateralBalance,
    ledgerWalletContractDataDisabled,
    insufficientEthFundsForTx,
    stopLossOnNearLiquidationRatio,
    isStopLossEditingStage,
    stopLossHigherThanCurrentOrNext,
  } = state
  const errorMessages: VaultErrorMessage[] = []

  if (isStopLossEditingStage) {
    errorMessages.push(
      ...errorMessagesHandler({
        stopLossOnNearLiquidationRatio,
        stopLossHigherThanCurrentOrNext,
      }),
    )
  }

  if (isEditingStage) {
    errorMessages.push(
      ...errorMessagesHandler({
        depositAmountExceedsCollateralBalance,
        depositingAllEthBalance,
        generateAmountExceedsDaiYieldFromDepositingCollateral,
        generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice,
        generateAmountExceedsDebtCeiling,
        generateAmountLessThanDebtFloor,
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

export function validateWarnings(state: OpenVaultState): OpenVaultState {
  const {
    errorMessages,
    isEditingStage,
    vaultWillBeAtRiskLevelDanger,
    vaultWillBeAtRiskLevelDangerAtNextPrice,
    vaultWillBeAtRiskLevelWarning,
    vaultWillBeAtRiskLevelWarningAtNextPrice,
    potentialGenerateAmountLessThanDebtFloor,
    currentCollRatioCloseToStopLoss,
    isStopLossEditingStage,
  } = state

  const warningMessages: VaultWarningMessage[] = []

  if (errorMessages.length) return { ...state, warningMessages }

  if (isStopLossEditingStage) {
    warningMessages.push(
      ...warningMessagesHandler({
        currentCollRatioCloseToStopLoss,
      }),
    )
  }

  if (isEditingStage) {
    warningMessages.push(
      ...warningMessagesHandler({
        potentialGenerateAmountLessThanDebtFloor,
        vaultWillBeAtRiskLevelDanger,
        vaultWillBeAtRiskLevelDangerAtNextPrice,
        vaultWillBeAtRiskLevelWarning,
        vaultWillBeAtRiskLevelWarningAtNextPrice,
      }),
    )
  }
  return { ...state, warningMessages }
}

export function finalValidation(state: OpenVaultState): OpenVaultState {
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
