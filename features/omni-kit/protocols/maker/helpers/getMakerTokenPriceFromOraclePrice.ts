import type BigNumber from 'bignumber.js'

interface GetMakerTokenPriceFromOraclePriceParamsWithCollateral {
  collateralPrice: BigNumber
  quotePrice?: never
}
interface GetMakerTokenPriceFromOraclePriceParamsWithQuote {
  collateralPrice?: never
  quotePrice: BigNumber
}

type GetMakerTokenPriceFromOraclePriceParams = (
  | GetMakerTokenPriceFromOraclePriceParamsWithCollateral
  | GetMakerTokenPriceFromOraclePriceParamsWithQuote
) & {
  marketPrice: BigNumber
}

export function getMakerTokenPriceFromOraclePrice({
  collateralPrice,
  marketPrice,
  quotePrice,
}: GetMakerTokenPriceFromOraclePriceParams) {
  return collateralPrice ? marketPrice.div(collateralPrice) : marketPrice.div(quotePrice)
}
