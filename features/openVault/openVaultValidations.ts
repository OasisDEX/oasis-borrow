import { maxUint256 } from 'blockchain/calls/erc20'
import { zero } from 'helpers/zero'

import { OpenVaultState } from './openVault'

export type OpenVaultErrorMessage =
  | 'depositAmountGreaterThanMaxDepositAmount'
  | 'generateAmountLessThanDebtFloor'
  | 'generateAmountGreaterThanDebtCeiling'
  | 'vaultUnderCollateralized'
  | 'allowanceAmountEmpty'
  | 'customAllowanceAmountGreaterThanMaxUint256'
  | 'customAllowanceAmountLessThanDepositAmount'

export type OpenVaultWarningMessage =
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'noProxyAddress'
  | 'noAllowance'
  | 'allowanceLessThanDepositAmount'

export function validateErrors(state: OpenVaultState): OpenVaultState {
  const {
    depositAmount,
    maxDepositAmount,
    generateAmount,
    allowanceAmount,
    debtFloor,
    ilkDebtAvailable,
    afterCollateralizationRatio,
    liquidationRatio,
    stage,
  } = state

  const errorMessages: OpenVaultErrorMessage[] = []

  if (depositAmount?.gt(maxDepositAmount)) {
    errorMessages.push('depositAmountGreaterThanMaxDepositAmount')
  }

  if (generateAmount?.lt(debtFloor)) {
    errorMessages.push('generateAmountLessThanDebtFloor')
  }

  if (generateAmount?.gt(ilkDebtAvailable)) {
    errorMessages.push('generateAmountGreaterThanDebtCeiling')
  }

  if (stage === 'allowanceWaitingForConfirmation' || stage === 'allowanceFailure') {
    if (!allowanceAmount) {
      errorMessages.push('allowanceAmountEmpty')
    }
    if (allowanceAmount?.gt(maxUint256)) {
      errorMessages.push('customAllowanceAmountGreaterThanMaxUint256')
    }
    if (depositAmount && allowanceAmount && allowanceAmount.lt(depositAmount)) {
      errorMessages.push('customAllowanceAmountLessThanDepositAmount')
    }
  }

  if (generateAmount?.gt(zero) && afterCollateralizationRatio.lt(liquidationRatio)) {
    errorMessages.push('vaultUnderCollateralized')
  }

  return { ...state, errorMessages }
}

export function validateWarnings(state: OpenVaultState): OpenVaultState {
  const {
    allowance,
    depositAmount,
    generateAmount,
    depositAmountUSD,
    debtFloor,
    proxyAddress,
    token,
  } = state

  const warningMessages: OpenVaultWarningMessage[] = []

  if (depositAmountUSD && depositAmount?.gt(zero) && depositAmountUSD.lt(debtFloor)) {
    warningMessages.push('potentialGenerateAmountLessThanDebtFloor')
  }

  if (!proxyAddress) {
    warningMessages.push('noProxyAddress')
  }

  if (!depositAmount) {
    warningMessages.push('depositAmountEmpty')
  }

  if (!generateAmount) {
    warningMessages.push('generateAmountEmpty')
  }

  if (token !== 'ETH') {
    if (!allowance || !allowance.gt(zero)) {
      warningMessages.push('noAllowance')
    }
    if (depositAmount && allowance && depositAmount.gt(allowance)) {
      warningMessages.push('allowanceLessThanDepositAmount')
    }
  }

  return { ...state, warningMessages }
}
