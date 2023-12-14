import { normalizeAmount, getTheLeastCommonMultiple } from './normalize-amount'
import { PERCENT_DECIMALS, PRICE_DECIMALS, Price, TokenBalance, LTV } from '~types'
export function calculateLtv({
  collateral,
  debt,
  collateralPriceInDebt,
}: {
  collateral: TokenBalance
  debt: TokenBalance
  collateralPriceInDebt: Price
}): LTV {
  const commonPrecision = getTheLeastCommonMultiple(collateral.token.decimals, debt.token.decimals)
  const collateralNormalized = normalizeAmount(collateral, commonPrecision)
  const debtNormalized = normalizeAmount(debt, commonPrecision)
  return (
    (debtNormalized * 10n ** PERCENT_DECIMALS) /
    ((collateralNormalized * collateralPriceInDebt) / 10n ** BigInt(PRICE_DECIMALS))
  )
}
