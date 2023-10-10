import { maxUint256 } from 'blockchain/calls/erc20.constants'

import type { ManageMultiplyVaultChange } from './ManageMultiplyVaultChange.types'
import type { ManageMultiplyVaultState } from './ManageMultiplyVaultState.types'

export function applyManageVaultAllowance(
  change: ManageMultiplyVaultChange,
  state: ManageMultiplyVaultState,
): ManageMultiplyVaultState {
  if (change.kind === 'collateralAllowance') {
    const { collateralAllowanceAmount } = change
    return {
      ...state,
      collateralAllowanceAmount,
    }
  }

  if (change.kind === 'collateralAllowanceAsDepositAmount') {
    const { depositAmount } = state
    return {
      ...state,
      selectedCollateralAllowanceRadio: 'depositAmount',
      collateralAllowanceAmount: depositAmount,
    }
  }

  if (change.kind === 'collateralAllowanceUnlimited') {
    return {
      ...state,
      selectedCollateralAllowanceRadio: 'unlimited',
      collateralAllowanceAmount: maxUint256,
    }
  }

  if (change.kind === 'collateralAllowanceReset') {
    return {
      ...state,
      selectedCollateralAllowanceRadio: 'custom',
      collateralAllowanceAmount: undefined,
    }
  }

  if (change.kind === 'daiAllowance') {
    const { daiAllowanceAmount } = change
    return {
      ...state,
      daiAllowanceAmount,
    }
  }

  if (change.kind === 'daiAllowanceAsPaybackAmount') {
    const {
      paybackAmount,
      vault: { debtOffset },
    } = state
    return {
      ...state,
      selectedDaiAllowanceRadio: 'actionAmount',
      daiAllowanceAmount: paybackAmount!.plus(debtOffset),
    }
  }

  if (change.kind === 'daiAllowanceAsDepositDaiAmount') {
    const {
      depositDaiAmount,
      vault: { debtOffset },
    } = state
    return {
      ...state,
      selectedDaiAllowanceRadio: 'actionAmount',
      daiAllowanceAmount: depositDaiAmount!.plus(debtOffset),
    }
  }

  if (change.kind === 'daiAllowanceUnlimited') {
    return {
      ...state,
      selectedDaiAllowanceRadio: 'unlimited',
      daiAllowanceAmount: maxUint256,
    }
  }

  if (change.kind === 'daiAllowanceReset') {
    return {
      ...state,
      selectedDaiAllowanceRadio: 'custom',
      daiAllowanceAmount: undefined,
    }
  }

  return state
}
