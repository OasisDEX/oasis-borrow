import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'

import { ManageMultiplyVaultChange, ManageMultiplyVaultState } from './manageMultiplyVault'

export const allowanceDefaults: Partial<ManageMultiplyVaultState> = {
  collateralAllowanceAmount: maxUint256,
  daiAllowanceAmount: maxUint256,
}

interface DaiAllowanceChange {
  kind: 'daiAllowance'
  daiAllowanceAmount?: BigNumber
}

interface DaiAllowanceUnlimitedChange {
  kind: 'daiAllowanceUnlimited'
}

interface DaiAllowancePaybackChange {
  kind: 'daiAllowanceAsPaybackAmount'
}

interface DaiAllowanceDaiAmountChange {
  kind: 'daiAllowanceAsDepositDaiAmount'
}

interface DaiAllowanceReset {
  kind: 'daiAllowanceReset'
}

interface CollateralAllowanceChange {
  kind: 'collateralAllowance'
  collateralAllowanceAmount?: BigNumber
}

interface CollateralAllowanceUnlimitedChange {
  kind: 'collateralAllowanceUnlimited'
}

interface CollateralAllowanceDepositChange {
  kind: 'collateralAllowanceAsDepositAmount'
}

interface CollateralAllowanceReset {
  kind: 'collateralAllowanceReset'
}

export type ManageVaultAllowanceChange =
  | DaiAllowanceChange
  | DaiAllowanceUnlimitedChange
  | DaiAllowancePaybackChange
  | DaiAllowanceDaiAmountChange
  | DaiAllowanceReset
  | CollateralAllowanceChange
  | CollateralAllowanceUnlimitedChange
  | CollateralAllowanceDepositChange
  | CollateralAllowanceReset

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
