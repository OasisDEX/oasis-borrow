import { LTV, PERCENT_DECIMALS, PositionLike, PRICE_DECIMALS } from '~types'
import { getTheLeastCommonMultiple, normalizeAmount } from './normalize-amount'
import { z } from 'zod'

export function calculateCollateralPriceInDebtBasedOnLtv(params: PositionLike): bigint {
  const { collateral, debt, ltv } = params
  const collateralDecimals = collateral.token.decimals
  const debtDecimals = debt.token.decimals

  const commonPrecision = getTheLeastCommonMultiple(collateralDecimals, debtDecimals)
  const normalizedCollateral = normalizeAmount(collateral, commonPrecision)
  const normalizedDebt = normalizeAmount(debt, commonPrecision)

  return (
    (normalizedDebt * 10n ** PRICE_DECIMALS) /
    ((normalizedCollateral * ltv) / 10n ** PERCENT_DECIMALS)
  )
}
