import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'

import { OpenMultiplyVaultChange, OpenMultiplyVaultState } from './openMultiplyVault'
import { AllowanceOption } from '../../../allowance/allowance'

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
  state: OpenMultiplyVaultState,
  change: OpenMultiplyVaultChange,
): OpenMultiplyVaultState {
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
      selectedAllowanceRadio: AllowanceOption.DEPOSIT_AMOUNT,
      allowanceAmount: depositAmount,
    }
  }

  if (change.kind === 'allowanceUnlimited') {
    return {
      ...state,
      selectedAllowanceRadio: AllowanceOption.UNLIMITED,
      allowanceAmount: maxUint256,
    }
  }

  if (change.kind === 'allowanceCustom') {
    return {
      ...state,
      selectedAllowanceRadio: AllowanceOption.CUSTOM,
      allowanceAmount: undefined,
    }
  }

  return state
}
