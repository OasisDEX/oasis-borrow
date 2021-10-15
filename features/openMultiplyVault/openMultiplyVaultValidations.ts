import { isNullish } from 'helpers/functions'

import { OpenMultiplyVaultState } from './openMultiplyVault'

export type OpenMultiplyVaultErrorMessage =
  | 'depositAmountExceedsCollateralBalance'
  | 'depositingAllEthBalance'
  | 'generateAmountExceedsDaiYieldFromDepositingCollateral'
  | 'generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice'
  | 'generateAmountExceedsDebtCeiling'
  | 'generateAmountLessThanDebtFloor'
  | 'generateAmountMoreThanMaxFlashAmount'
  | 'customAllowanceAmountExceedsMaxUint256'
  | 'customAllowanceAmountLessThanDepositAmount'
  | 'ledgerWalletContractDataDisabled'
  | 'exchangeError'

export function validateErrors(state: OpenMultiplyVaultState): OpenMultiplyVaultState {
  const {
    depositAmount,
    balanceInfo,
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
    exchangeError,
  } = state
  const errorMessages: OpenMultiplyVaultErrorMessage[] = []

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

    if (exchangeError) {
      errorMessages.push('exchangeError')
    }

    if (generateAmountMoreThanMaxFlashAmount) {
      errorMessages.push('generateAmountMoreThanMaxFlashAmount')
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

  if (stage === 'openFailure' || stage === 'proxyFailure' || stage === 'allowanceFailure') {
    if (state.txError?.name === 'EthAppPleaseEnableContractData') {
      errorMessages.push('ledgerWalletContractDataDisabled')
    }
  }

  return { ...state, errorMessages }
}

export type OpenMultiplyVaultWarningMessage =
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'vaultWillBeAtRiskLevelDanger'
  | 'vaultWillBeAtRiskLevelWarning'
  | 'vaultWillBeAtRiskLevelDangerAtNextPrice'
  | 'vaultWillBeAtRiskLevelWarningAtNextPrice'

export function validateWarnings(state: OpenMultiplyVaultState): OpenMultiplyVaultState {
  const {
    errorMessages,
    isEditingStage,
    vaultWillBeAtRiskLevelDanger,
    vaultWillBeAtRiskLevelDangerAtNextPrice,
    vaultWillBeAtRiskLevelWarning,
    vaultWillBeAtRiskLevelWarningAtNextPrice,
    depositAmount,
    ilkData,
    afterOutstandingDebt,
  } = state

  const warningMessages: OpenMultiplyVaultWarningMessage[] = []

  if (errorMessages.length) return { ...state, warningMessages }

  if (isEditingStage) {
    if (!isNullish(depositAmount) && afterOutstandingDebt.lt(ilkData.debtFloor)) {
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
