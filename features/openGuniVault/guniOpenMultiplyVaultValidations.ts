import { isNullish } from 'helpers/functions'

import { errorMessagesHandler } from '../form/errorMessagesHandler'
import {
  VaultErrorMessage,
  VaultWarningMessage,
} from '../openMultiplyVault/openMultiplyVaultValidations'
import { OpenGuniVaultState } from './openGuniVault'

export function validateGuniErrors(state: OpenGuniVaultState): OpenGuniVaultState {
  const {
    stage,
    isEditingStage,
    generateAmountMoreThanMaxFlashAmount,
    generateAmountLessThanDebtFloor,
    generateAmountExceedsDebtCeiling,
    customAllowanceAmountExceedsMaxUint256,
    customAllowanceAmountLessThanDepositAmount,
    exchangeError,
    ledgerWalletContractDataDisabled,
    depositAmountExceedsCollateralBalance,
  } = state
  const errorMessages: VaultErrorMessage[] = []

  if (isEditingStage) {
    errorMessages.push(
      ...errorMessagesHandler({
        depositAmountExceedsCollateralBalance,
        generateAmountLessThanDebtFloor,
        generateAmountExceedsDebtCeiling,
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
