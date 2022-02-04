import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'

import { OpenVaultChange, OpenVaultState } from './openVault'

interface AllowanceChange {
  kind: 'allowance'
  allowanceAmount?: BigNumber
}

interface AllowanceUnlimitedChange {
  kind: 'allowanceUnlimited'
}

interface AllowanceDepositChange {
  kind: 'allowanceAsDepositAmount'
}

interface AllowanceCustom {
  kind: 'allowanceCustom'
}

export type OpenVaultAllowanceChange =
  | AllowanceChange
  | AllowanceUnlimitedChange
  | AllowanceDepositChange
  | AllowanceCustom

export function applyOpenVaultAllowance(
  state: OpenVaultState,
  change: OpenVaultChange,
): OpenVaultState {
  if (change.kind === 'allowance') {
    const { allowanceAmount } = change
    return {
      ...state,
      allowanceAmount,
    }
  }

  if (change.kind === 'allowanceAsDepositAmount') {
    const { depositAmount } = state
    return {
      ...state,
      selectedAllowanceRadio: 'depositAmount',
      allowanceAmount: depositAmount,
    }
  }

  if (change.kind === 'allowanceUnlimited') {
    return {
      ...state,
      selectedAllowanceRadio: 'unlimited',
      allowanceAmount: maxUint256,
    }
  }

  if (change.kind === 'allowanceCustom') {
    return {
      ...state,
      selectedAllowanceRadio: 'custom',
      allowanceAmount: undefined,
    }
  }

  return state
}
