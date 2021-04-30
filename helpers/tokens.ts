import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { Decimal } from 'decimal.js'

/*
 * Should return a precision amount, no greater than 18 or the max precision
 * for that token, for which a single fractional unit is approximately equivalent to 0.01 USD.
 *
 * e.g:
 * 1 ETH === 10,000 USD :: Precision - 7 :: 0.0000001 ETH = 0.01 USD
 */
export function calculateTokenPrecisionByValue({
  token,
  usdPrice,
}: {
  token: string
  usdPrice: BigNumber
}) {
  const ten = new Decimal(10)
  const price = new Decimal(usdPrice.toString())
  const tokenPrecision = getToken(token).precision
  const tokenPricePerDollar = price.pow(-1)
  const tokenPricePerCent = tokenPricePerDollar.times(new Decimal(10).pow(-2))

  const magnitude = tokenPricePerCent.logarithm(ten).times(-1).floor()
  return magnitude.gt(tokenPrecision) ? tokenPrecision : magnitude.gt(0) ? magnitude.toNumber() : 0
}
