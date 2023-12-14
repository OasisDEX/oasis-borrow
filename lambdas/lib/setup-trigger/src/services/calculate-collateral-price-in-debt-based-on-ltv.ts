import { LTV, PERCENT_DECIMALS, PositionLike, Price, PRICE_DECIMALS } from '~types'
import { getTheLeastCommonMultiple, normalizeAmount } from './normalize-amount'
import { z } from 'zod'

export function calculateCollateralPriceInDebtBasedOnLtv(params: PositionLike): Price {
  const { collateral, debt, ltv } = params
  const collateralDecimals = collateral.token.decimals
  const debtDecimals = debt.token.decimals

  const commonPrecision = getTheLeastCommonMultiple(collateralDecimals, debtDecimals)
  const normalizedCollateral = normalizeAmount(collateral, commonPrecision)
  const normalizedDebt = normalizeAmount(debt, commonPrecision)

  if (normalizedCollateral === 0n || normalizedDebt === 0n || ltv === 0n) {
    return 0n
  }

  return (
    (normalizedDebt * 10n ** PRICE_DECIMALS) /
    ((normalizedCollateral * ltv) / 10n ** PERCENT_DECIMALS)
  )
}
