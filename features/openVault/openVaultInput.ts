import BigNumber from 'bignumber.js'

import { OpenVaultChange, OpenVaultState } from './openVault'

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

export type OpenVaultInputChange =
  | DepositChange
  | DepositUSDChange
  | DepositMaxChange
  | GenerateChange
  | GenerateMaxChange

export function applyOpenVaultInput(
  change: OpenVaultChange,
  state: OpenVaultState,
): OpenVaultState {
  if (change.kind === 'deposit') {
    const { depositAmount } = change
    const { currentCollateralPrice } = state
    const depositAmountUSD = depositAmount && currentCollateralPrice.times(depositAmount)

    return {
      ...state,
      depositAmount,
      depositAmountUSD,
      ...(!depositAmount && {
        showGenerateOption: false,
        generateAmount: undefined,
      }),
    }
  }

  if (change.kind === 'depositUSD') {
    const { depositAmountUSD } = change
    const { currentCollateralPrice } = state
    const depositAmount = depositAmountUSD && depositAmountUSD.div(currentCollateralPrice)

    return {
      ...state,
      depositAmount,
      depositAmountUSD,
      ...(!depositAmountUSD && {
        showGenerateOption: false,
        generateAmount: undefined,
      }),
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

  if (change.kind === 'generate') {
    const { generateAmount } = change
    return {
      ...state,
      generateAmount,
    }
  }

  if (change.kind === 'generateMax') {
    const { maxGenerateAmount } = state

    return {
      ...state,
      generateAmount: maxGenerateAmount,
    }
  }

  return state
}
