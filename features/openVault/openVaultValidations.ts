import { maxUint256 } from 'blockchain/calls/erc20'
import { zero } from 'helpers/zero'

import { OpenVaultState } from './openVault'

export type OpenVaultErrorMessage =
  | 'vaultWillBeUnderCollateralized'
  | 'vaultWillBeUnderCollateralizedAtNextPrice'
  | 'depositAmountExceedsCollateralBalance'
  | 'generateAmountExceedsDaiYieldFromDepositingCollateral'
  | 'generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice'
  | 'generateAmountExceedsDebtCeiling'
  | 'generateAmountLessThanDebtFloor'
  | 'customAllowanceAmountEmpty'
  | 'customAllowanceAmountGreaterThanMaxUint256'
  | 'customAllowanceAmountLessThanDepositAmount'

export function validateErrors(state: OpenVaultState): OpenVaultState {
  const {
    generateAmount,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    ilkData,
  } = state
  const errorMessages: OpenVaultErrorMessage[] = []

  const vaultWillBeUnderCollateralized =
    generateAmount?.gt(zero) &&
    afterCollateralizationRatio.lt(ilkData.liquidationRatio) &&
    !afterCollateralizationRatio.isZero()

  if (vaultWillBeUnderCollateralized) {
    errorMessages.push('vaultWillBeUnderCollateralized')
  }

  const vaultWillBeUnderCollateralizedAtNextPrice =
    generateAmount?.gt(zero) &&
    afterCollateralizationRatioAtNextPrice.lt(ilkData.liquidationRatio) &&
    !afterCollateralizationRatioAtNextPrice.isZero()

  if (!vaultWillBeUnderCollateralized && vaultWillBeUnderCollateralizedAtNextPrice) {
    errorMessages.push('vaultWillBeUnderCollateralizedAtNextPrice')
  }

  // if (depositAmount?.gt(maxDepositAmount)) {
  //   errorMessages.push('depositAmountGreaterThanMaxDepositAmount')
  // }

  // if (generateAmount?.lt(debtFloor)) {
  //   errorMessages.push('generateAmountLessThanDebtFloor')
  // }

  // if (generateAmount?.gt(ilkDebtAvailable)) {
  //   errorMessages.push('generateAmountGreaterThanDebtCeiling')
  // }

  // if (stage === 'allowanceWaitingForConfirmation' || stage === 'allowanceFailure') {
  //   if (!allowanceAmount) {
  //     errorMessages.push('allowanceAmountEmpty')
  //   }
  //   if (allowanceAmount?.gt(maxUint256)) {
  //     errorMessages.push('customAllowanceAmountGreaterThanMaxUint256')
  //   }
  //   if (depositAmount && allowanceAmount && allowanceAmount.lt(depositAmount)) {
  //     errorMessages.push('customAllowanceAmountLessThanDepositAmount')
  //   }
  // }

  // if (generateAmount?.gt(zero) && afterCollateralizationRatio.lt(liquidationRatio)) {
  //   errorMessages.push('vaultUnderCollateralized')
  // }

  return { ...state, errorMessages }
}

export type OpenVaultWarningMessage =
  | 'openingEmptyVault'
  | 'openingVaultWithCollateralOnly'
  | 'openingVaultWithCollateralAndDebt'
  | 'noProxyAddress'
  | 'insufficientAllowance'
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'vaultWillBeAtRiskLevelDanger'
  | 'vaultWillBeAtRiskLevelWarning'
  | 'vaultWillBeAtRiskLevelDangerAtNextPrice'
  | 'vaultWillBeAtRiskLevelWarningAtNextPrice'
  | 'depositingAllCollateralBalance'
  | 'generatingAllDaiFromIlkDebtAvailable'
  | 'generatingAllDaiYieldFromDepositingCollateral'
  | 'generatingAllDaiYieldFromDepositingCollateralAtNextPrice'

export function validateWarnings(state: OpenVaultState): OpenVaultState {
  const warningMessages: OpenVaultWarningMessage[] = []

  // if (depositAmountUSD && depositAmount?.gt(zero) && depositAmountUSD.lt(debtFloor)) {
  //   warningMessages.push('potentialGenerateAmountLessThanDebtFloor')
  // }

  // if (!proxyAddress) {
  //   warningMessages.push('noProxyAddress')
  // }

  // if (token !== 'ETH') {
  //   if (!allowance || !allowance.gt(zero)) {
  //     warningMessages.push('noAllowance')
  //   }
  //   if (depositAmount && allowance && depositAmount.gt(allowance)) {
  //     warningMessages.push('allowanceLessThanDepositAmount')
  //   }
  // }

  return { ...state, warningMessages }
}
