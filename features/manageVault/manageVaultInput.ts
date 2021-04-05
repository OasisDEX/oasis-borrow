import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'

import { ManageVaultChange, ManageVaultState } from './manageVault'

interface DepositChange {
  kind: 'deposit'
  depositAmount?: BigNumber
}

interface DepositUSDChange {
  kind: 'depositUSD'
  depositAmountUSD?: BigNumber
}

interface DepositMaxChange {
  kind: 'depositMax'
}

interface GenerateChange {
  kind: 'generate'
  generateAmount?: BigNumber
}

interface GenerateMaxChange {
  kind: 'generateMax'
}

interface WithdrawChange {
  kind: 'withdraw'
  withdrawAmount?: BigNumber
}

interface WithdrawUSDChange {
  kind: 'withdrawUSD'
  withdrawAmountUSD?: BigNumber
}

interface WithdrawMaxChange {
  kind: 'withdrawMax'
}

interface PaybackChange {
  kind: 'payback'
  paybackAmount?: BigNumber
}

interface PaybackMaxChange {
  kind: 'paybackMax'
}

export type ManageVaultInputChange =
  | DepositChange
  | DepositUSDChange
  | DepositMaxChange
  | GenerateChange
  | GenerateMaxChange
  | WithdrawChange
  | WithdrawUSDChange
  | WithdrawMaxChange
  | PaybackChange
  | PaybackMaxChange

export const depositAndGenerateDefaults: Partial<ManageVaultState> = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  generateAmount: undefined,
}

export const paybackAndWithdrawDefaults: Partial<ManageVaultState> = {
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
  paybackAmount: undefined,
}

export function applyManageVaultInput(change: ManageVaultChange, state: ManageVaultState) {
  if (change.kind === 'deposit') {
    const { depositAmount } = change
    const { stage, currentCollateralPrice } = state
    const depositAmountUSD = depositAmount && currentCollateralPrice.times(depositAmount)

    return {
      ...state,
      depositAmount,
      depositAmountUSD,
      ...(!depositAmount &&
        stage === 'collateralEditing' && {
          showDepositAndGenerateOption: false,
          generateAmount: undefined,
        }),
      ...paybackAndWithdrawDefaults,
    }
  }

  if (change.kind === 'depositUSD') {
    const { depositAmountUSD } = change
    const { stage, currentCollateralPrice } = state
    const depositAmount = depositAmountUSD && depositAmountUSD.div(currentCollateralPrice)

    return {
      ...state,
      depositAmount,
      depositAmountUSD,
      ...(!depositAmountUSD &&
        stage === 'collateralEditing' && {
          showDepositAndGenerateOption: false,
          generateAmount: undefined,
        }),
      ...paybackAndWithdrawDefaults,
    }
  }

  if (change.kind === 'depositMax') {
    const { maxDepositAmount, maxDepositAmountUSD } = state

    return {
      ...state,
      depositAmount: maxDepositAmount,
      depositAmountUSD: maxDepositAmountUSD,
      ...paybackAndWithdrawDefaults,
    }
  }

  if (change.kind === 'generate') {
    const { generateAmount } = change
    const { stage } = state
    return {
      ...state,
      generateAmount,
      ...(!generateAmount &&
        stage === 'daiEditing' && {
          showDepositAndGenerateOption: false,
          depositAmount: undefined,
          depositAmountUSD: undefined,
        }),
      ...paybackAndWithdrawDefaults,
    }
  }

  if (change.kind === 'generateMax') {
    const { maxGenerateAmount } = state

    return {
      ...state,
      generateAmount: maxGenerateAmount,
      ...paybackAndWithdrawDefaults,
    }
  }

  if (change.kind === 'withdraw') {
    const { withdrawAmount } = change
    const { stage, currentCollateralPrice } = state
    const withdrawAmountUSD = withdrawAmount && currentCollateralPrice.times(withdrawAmount)

    return {
      ...state,
      withdrawAmount,
      withdrawAmountUSD,
      ...(!withdrawAmount &&
        stage === 'collateralEditing' && {
          showPaybackAndWithdrawOption: false,
          paybackAmount: undefined,
        }),
      ...depositAndGenerateDefaults,
    }
  }

  if (change.kind === 'withdrawUSD') {
    const { withdrawAmountUSD } = change
    const { stage, currentCollateralPrice } = state
    const withdrawAmount =
      withdrawAmountUSD && withdrawAmountUSD.gt(zero)
        ? withdrawAmountUSD.div(currentCollateralPrice)
        : undefined

    return {
      ...state,
      withdrawAmount,
      withdrawAmountUSD,
      ...(!withdrawAmountUSD &&
        stage === 'collateralEditing' && {
          showPaybackAndWithdrawOption: false,
          paybackAmount: undefined,
        }),
      ...depositAndGenerateDefaults,
    }
  }

  if (change.kind === 'withdrawMax') {
    const { maxWithdrawAmount, maxWithdrawAmountUSD } = state
    return {
      ...state,
      withdrawAmount: maxWithdrawAmount,
      withdrawAmountUSD: maxWithdrawAmountUSD,
      ...depositAndGenerateDefaults,
    }
  }

  if (change.kind === 'payback') {
    const { paybackAmount } = change
    const { stage } = state
    return {
      ...state,
      paybackAmount,
      ...(!paybackAmount &&
        stage === 'daiEditing' && {
          showPaybackAndWithdrawOption: false,
          withdrawAmount: undefined,
          withdrawAmountUSD: undefined,
        }),
      ...depositAndGenerateDefaults,
    }
  }

  if (change.kind === 'paybackMax') {
    const { maxPaybackAmount } = state

    return {
      ...state,
      paybackAmount: maxPaybackAmount,
      ...depositAndGenerateDefaults,
    }
  }

  return state
}
