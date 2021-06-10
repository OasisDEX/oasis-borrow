import BigNumber from 'bignumber.js'

import { LeverageVaultChange, LeverageVaultState } from './leverageVault'

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

interface LeverageChange {
  kind: 'leverage'
  leverage?: BigNumber
}

export type OpenVaultInputChange =
  | DepositChange
  | DepositUSDChange
  | DepositMaxChange
  | LeverageChange

export function applyOpenVaultInput(
  change: LeverageVaultChange,
  state: LeverageVaultState,
): LeverageVaultState {
  if (change.kind === 'deposit') {
    const { depositAmount } = change
    const { priceInfo } = state
    const depositAmountUSD = depositAmount && priceInfo.currentCollateralPrice.times(depositAmount)

    return {
      ...state,
      depositAmount,
      depositAmountUSD,
      leverage: undefined,
    }
  }

  if (change.kind === 'depositUSD') {
    const { depositAmountUSD } = change
    const { priceInfo } = state
    const depositAmount = depositAmountUSD && depositAmountUSD.div(priceInfo.currentCollateralPrice)

    return {
      ...state,
      depositAmount,
      depositAmountUSD,
      leverage: undefined,
    }
  }

  if (change.kind === 'depositMax') {
    const { maxDepositAmount, maxDepositAmountUSD } = state

    return {
      ...state,
      depositAmount: maxDepositAmount,
      depositAmountUSD: maxDepositAmountUSD,
    }
  }

  if (change.kind === 'leverage') {
    return {
      ...state,
      leverage: change.leverage,
    }
  }

  return state
}
