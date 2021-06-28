import BigNumber from 'bignumber.js'

import { OpenMultiplyVaultChange, OpenMultiplyVaultState } from './openMultiplyVault'

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

interface MultiplyChange {
  kind: 'slider'
  slider?: BigNumber
}

export type OpenVaultInputChange =
  | DepositChange
  | DepositUSDChange
  | DepositMaxChange
  | MultiplyChange

export function applyOpenVaultInput(
  change: OpenMultiplyVaultChange,
  state: OpenMultiplyVaultState,
): OpenMultiplyVaultState {
  if (change.kind === 'deposit') {
    const { depositAmount } = change
    const { priceInfo } = state
    const depositAmountUSD = depositAmount && priceInfo.currentCollateralPrice.times(depositAmount)

    return {
      ...state,
      depositAmount,
      depositAmountUSD,
      multiply: undefined,
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
      multiply: undefined,
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

  if (change.kind === 'slider') {
    return {
      ...state,
      slider: change.slider,
    }
  }

  return state
}
