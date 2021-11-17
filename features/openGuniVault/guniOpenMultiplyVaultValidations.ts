import { isNullish } from 'helpers/functions'

import {
  VaultErrorMessage,
  VaultWarningMessage,
} from '../openMultiplyVault/openMultiplyVaultValidations'
import { OpenGuniVaultState } from './openGuniVault'

export function validateGuniErrors(state: OpenGuniVaultState): OpenGuniVaultState {
  const {
    depositAmount,
    balanceInfo,
    stage,
    isEditingStage,
    generateAmountMoreThanMaxFlashAmount,
    generateAmountLessThanDebtFloor,
    generateAmountExceedsDebtCeiling,
    customAllowanceAmountExceedsMaxUint256,
    customAllowanceAmountLessThanDepositAmount,
    exchangeError,
  } = state
  const errorMessages: VaultErrorMessage[] = []

  if (isEditingStage) {
    if (depositAmount?.gt(balanceInfo.daiBalance)) {
      errorMessages.push('depositAmountExceedsCollateralBalance')
    }

    if (generateAmountLessThanDebtFloor) {
      errorMessages.push('generateAmountLessThanDebtFloor')
    }

    if (generateAmountExceedsDebtCeiling) {
      errorMessages.push('generateAmountExceedsDebtCeiling')
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

  if (stage === 'txFailure' || stage === 'proxyFailure' || stage === 'allowanceFailure') {
    if (state.txError?.name === 'EthAppPleaseEnableContractData') {
      errorMessages.push('ledgerWalletContractDataDisabled')
    }
  }

  return { ...state, errorMessages }
}

export function validateGuniWarnings(state: OpenGuniVaultState): OpenGuniVaultState {
  const {
    errorMessages,
    isEditingStage,

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
  }
  return { ...state, warningMessages }
}
