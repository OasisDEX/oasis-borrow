import { isNullish } from 'helpers/functions'

import { errorMessagesHandler } from '../form/errorMessagesHandler'
import { OpenMultiplyVaultState } from './openMultiplyVault'

export type VaultErrorMessage =
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
  | 'withdrawAmountExceedsFreeCollateral'
  | 'withdrawAmountExceedsFreeCollateralAtNextPrice'
  | 'generateAmountExceedsDaiYieldFromTotalCollateral'
  | 'generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice'
  | 'paybackAmountExceedsDaiBalance'
  | 'paybackAmountExceedsVaultDebt'
  | 'debtWillBeLessThanDebtFloor'
  | 'customCollateralAllowanceAmountExceedsMaxUint256'
  | 'customCollateralAllowanceAmountLessThanDepositAmount'
  | 'customDaiAllowanceAmountExceedsMaxUint256'
  | 'customDaiAllowanceAmountLessThanPaybackAmount'
  | 'withdrawCollateralOnVaultUnderDebtFloor'
  | 'shouldShowExchangeError'
  | 'hasToDepositCollateralOnEmptyVault'
  | 'depositCollateralOnVaultUnderDebtFloor'

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

export type VaultWarningMessage =
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'vaultWillBeAtRiskLevelDanger'
  | 'vaultWillBeAtRiskLevelWarning'
  | 'vaultWillBeAtRiskLevelDangerAtNextPrice'
  | 'vaultWillBeAtRiskLevelWarningAtNextPrice'
  | 'debtIsLessThanDebtFloor'

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

  const warningMessages: VaultWarningMessage[] = []

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
