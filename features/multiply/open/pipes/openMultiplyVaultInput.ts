import { calculateTokenPrecisionByValue } from 'helpers/tokens'

import type { OpenMultiplyVaultChange, OpenMultiplyVaultState } from './openMultiplyVault.types'

export function applyOpenVaultInput(
  state: OpenMultiplyVaultState,
  change: OpenMultiplyVaultChange,
): OpenMultiplyVaultState {
  if (change.kind === 'deposit') {
    const { depositAmount } = change
    const { priceInfo } = state
    const depositAmountUSD = depositAmount && priceInfo.currentCollateralPrice.times(depositAmount)

    return {
      ...state,
      depositAmount,
      depositAmountUSD,
      requiredCollRatio: undefined,
    }
  }

  if (change.kind === 'depositUSD') {
    const { depositAmountUSD } = change
    const { priceInfo, token } = state
    const currentCollateralPrice = priceInfo.currentCollateralPrice
    const currencyDigits = calculateTokenPrecisionByValue({
      token: token,
      usdPrice: currentCollateralPrice,
    })
    const depositAmount =
      depositAmountUSD && depositAmountUSD.div(priceInfo.currentCollateralPrice).dp(currencyDigits)

    return {
      ...state,
      depositAmount,
      depositAmountUSD,
      requiredCollRatio: undefined,
    }
  }

  if (change.kind === 'depositMax') {
    const { maxDepositAmount, maxDepositAmountUSD } = state

    return {
      ...state,
      depositAmount: maxDepositAmount,
      depositAmountUSD: maxDepositAmountUSD,
      requiredCollRatio: undefined,
    }
  }

  if (change.kind === 'requiredCollRatio') {
    return {
      ...state,
      requiredCollRatio: change.requiredCollRatio,
    }
  }

  return state
}
