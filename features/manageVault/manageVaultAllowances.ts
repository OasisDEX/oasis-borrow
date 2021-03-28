import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'

import { ManageVaultChange, ManageVaultState } from './manageVault'

export const allowanceDefaults: Partial<ManageVaultState> = {
  collateralAllowanceAmount: maxUint256,
  daiAllowanceAmount: maxUint256,
}

export enum ManageVaultAllowanceChangeKind {
  daiAllowance = 'daiAllowance',
  daiAllowanceUnlimited = 'daiAllowanceUnlimited',
  daiAllowanceAsPaybackAmount = 'daiAllowanceAsPaybackAmount',
  collateralAllowance = 'collateralAllowance',
  collateralAllowanceUnlimited = 'collateralAllowanceUnlimited',
  collateralAllowanceAsDepositAmount = 'collateralAllowanceAsDepositAmount',
  allowancesReset = 'allowancesReset',
}

interface DaiAllowanceChange {
  kind: ManageVaultAllowanceChangeKind.daiAllowance
  daiAllowanceAmount?: BigNumber
}

interface DaiAllowanceUnlimitedChange {
  kind: ManageVaultAllowanceChangeKind.daiAllowanceUnlimited
}

interface DaiAllowancePaybackChange {
  kind: ManageVaultAllowanceChangeKind.daiAllowanceAsPaybackAmount
}

interface CollateralAllowanceChange {
  kind: ManageVaultAllowanceChangeKind.collateralAllowance
  collateralAllowanceAmount?: BigNumber
}

interface CollateralAllowanceUnlimitedChange {
  kind: ManageVaultAllowanceChangeKind.collateralAllowanceUnlimited
}

interface CollateralAllowanceDepositChange {
  kind: ManageVaultAllowanceChangeKind.collateralAllowanceAsDepositAmount
}

interface AllowancesReset {
  kind: ManageVaultAllowanceChangeKind.allowancesReset
}

export type ManageVaultAllowanceChange =
  | DaiAllowanceChange
  | DaiAllowanceUnlimitedChange
  | DaiAllowancePaybackChange
  | CollateralAllowanceChange
  | CollateralAllowanceUnlimitedChange
  | CollateralAllowanceDepositChange
  | AllowancesReset

export function applyManageVaultAllowance(
  change: ManageVaultChange,
  state: ManageVaultState,
): ManageVaultState {
  if (change.kind === ManageVaultAllowanceChangeKind.collateralAllowance) {
    const { collateralAllowanceAmount } = change
    return {
      ...state,
      collateralAllowanceAmount,
    }
  }

  if (change.kind === ManageVaultAllowanceChangeKind.collateralAllowanceAsDepositAmount) {
    const { depositAmount } = state
    return {
      ...state,
      collateralAllowanceAmount: depositAmount,
    }
  }

  if (change.kind === ManageVaultAllowanceChangeKind.collateralAllowanceUnlimited) {
    return {
      ...state,
      collateralAllowanceAmount: maxUint256,
    }
  }

  if (change.kind === ManageVaultAllowanceChangeKind.daiAllowance) {
    const { daiAllowanceAmount } = change
    return {
      ...state,
      daiAllowanceAmount,
    }
  }

  if (change.kind === ManageVaultAllowanceChangeKind.daiAllowanceAsPaybackAmount) {
    const { paybackAmount } = state
    return {
      ...state,
      daiAllowanceAmount: paybackAmount,
    }
  }

  if (change.kind === ManageVaultAllowanceChangeKind.daiAllowanceUnlimited) {
    return {
      ...state,
      daiAllowanceAmount: maxUint256,
    }
  }

  if (change.kind === ManageVaultAllowanceChangeKind.allowancesReset) {
    return {
      ...state,
      ...allowanceDefaults,
    }
  }
  return state
}
