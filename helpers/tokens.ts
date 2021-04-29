import BigNumber from 'bignumber.js'

/*
 * Should return a precision amount, no greater than 18 or the max precision
 * for that token, for which a single fractional unit is approximately equivalent to 0.01 USD.
 *
 * e.g:
 * 1 ETH === 10,000 USD :: Precision - 7 :: 0.0000001 ETH = 0.01 USD
 */
export function calculateTokenPrecisionByValue({
  token,
  unitPrice,
}: {
  token: string
  unitPrice: BigNumber
}) {}
