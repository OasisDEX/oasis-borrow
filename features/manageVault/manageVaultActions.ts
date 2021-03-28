import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'
import { ManageVaultChange, ManageVaultState } from './manageVault'

export enum ManageVaultActionKind {
  deposit = 'deposit',
  depositUSD = 'depositUSD',
  depositMax = 'depositMax',
  generate = 'generate',
  generateMax = 'generateMax',
  withdraw = 'withdraw',
  withdrawUSD = 'withdrawUSD',
  withdrawMax = 'withdrawMax',
  payback = 'payback',
  paybackMax = 'paybackMax',
}

interface DepositChange {
  kind: ManageVaultActionKind.deposit
  depositAmount?: BigNumber
}

interface DepositUSDChange {
  kind: ManageVaultActionKind.depositUSD
  depositAmountUSD?: BigNumber
}

interface DepositMaxChange {
  kind: ManageVaultActionKind.depositMax
}

interface GenerateChange {
  kind: ManageVaultActionKind.generate
  generateAmount?: BigNumber
}

interface GenerateMaxChange {
  kind: ManageVaultActionKind.generateMax
}

interface WithdrawChange {
  kind: ManageVaultActionKind.withdraw
  withdrawAmount?: BigNumber
}

interface WithdrawUSDChange {
  kind: ManageVaultActionKind.withdrawUSD
  withdrawAmountUSD?: BigNumber
}

interface WithdrawMaxChange {
  kind: ManageVaultActionKind.withdrawMax
}

interface PaybackChange {
  kind: ManageVaultActionKind.payback
  paybackAmount?: BigNumber
}

interface PaybackMaxChange {
  kind: ManageVaultActionKind.paybackMax
}

export type ManageVaultActionChange =
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

export function applyManageVaultAction(change: ManageVaultChange, state: ManageVaultState) {
  if (change.kind === ManageVaultActionKind.deposit) {
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

  if (change.kind === ManageVaultActionKind.depositUSD) {
    const { depositAmountUSD } = change
    const { stage, currentCollateralPrice } = state
    const depositAmount = depositAmountUSD && depositAmountUSD.times(currentCollateralPrice)

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

  if (change.kind === ManageVaultActionKind.depositMax) {
    const { maxDepositAmount, maxDepositAmountUSD } = state

    return {
      ...state,
      depositAmount: maxDepositAmount,
      depositAmountUSD: maxDepositAmountUSD,
      ...paybackAndWithdrawDefaults,
    }
  }

  if (change.kind === ManageVaultActionKind.generate) {
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

  if (change.kind === ManageVaultActionKind.generateMax) {
    const { maxGenerateAmount } = state

    return {
      ...state,
      generateAmount: maxGenerateAmount,
      ...paybackAndWithdrawDefaults,
    }
  }

  if (change.kind === ManageVaultActionKind.withdraw) {
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

  if (change.kind === ManageVaultActionKind.withdrawUSD) {
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

  if (change.kind === ManageVaultActionKind.withdrawMax) {
    const { maxWithdrawAmount, maxWithdrawAmountUSD } = state
    return {
      ...state,
      withdrawAmount: maxWithdrawAmount,
      withdrawAmountUSD: maxWithdrawAmountUSD,
      ...depositAndGenerateDefaults,
    }
  }

  if (change.kind === ManageVaultActionKind.payback) {
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

  if (change.kind === ManageVaultActionKind.paybackMax) {
    const { maxPaybackAmount } = state

    return {
      ...state,
      paybackAmount: maxPaybackAmount,
      ...depositAndGenerateDefaults,
    }
  }

  return state
}
