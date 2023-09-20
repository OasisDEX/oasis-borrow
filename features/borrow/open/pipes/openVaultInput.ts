import { isNullish } from 'helpers/functions'
import { calculateTokenPrecisionByValue } from 'helpers/tokens'

import type { OpenVaultChange, OpenVaultState } from './openVault.types'

export function applyOpenVaultInput(
  state: OpenVaultState,
  change: OpenVaultChange,
): OpenVaultState {
  if (change.kind === 'deposit') {
    const { depositAmount } = change
    const { priceInfo } = state
    const depositAmountUSD = depositAmount && priceInfo.currentCollateralPrice.times(depositAmount)

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

  if (change.kind === 'generate' && state.showGenerateOption) {
    const { generateAmount } = change
    return {
      ...state,
      generateAmount,
    }
  }

  if (
    change.kind === 'generateMax' &&
    state.showGenerateOption &&
    !isNullish(state.depositAmount)
  ) {
    const { maxGenerateAmount } = state

    return {
      ...state,
      generateAmount: maxGenerateAmount,
    }
  }

  return state
}
