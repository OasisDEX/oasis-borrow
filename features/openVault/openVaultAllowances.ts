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

interface AllowanceReset {
  kind: 'allowanceReset'
}

export type OpenVaultAllowanceChange =
  | AllowanceChange
  | AllowanceUnlimitedChange
  | AllowanceDepositChange
  | AllowanceReset

export function applyOpenVaultAllowance(
  change: OpenVaultChange,
  state: OpenVaultState,
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

  if (change.kind === 'allowanceReset') {
    return {
      ...state,
      selectedAllowanceRadio: 'custom',
      allowanceAmount: undefined,
    }
  }

  return state
}
