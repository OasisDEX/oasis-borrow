import type BigNumber from 'bignumber.js'

interface GetMorphoTokenPriceFromOraclePriceParamsWithCollateral {
  collateralPrice: BigNumber
  quotePrice?: never
}
interface GetMorphoTokenPriceFromOraclePriceParamsWithQuote {
  collateralPrice?: never
  quotePrice: BigNumber
}

type GetMorphoTokenPriceFromOraclePriceParams = (
  | GetMorphoTokenPriceFromOraclePriceParamsWithCollateral
  | GetMorphoTokenPriceFromOraclePriceParamsWithQuote
) & {
  marketPrice: BigNumber
}

export function getMorphoTokenPriceFromOraclePrice({
  collateralPrice,
  marketPrice,
  quotePrice,
}: GetMorphoTokenPriceFromOraclePriceParams) {
  return collateralPrice ? marketPrice.div(collateralPrice) : marketPrice.div(quotePrice)
}
