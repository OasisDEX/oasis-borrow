import type BigNumber from 'bignumber.js'
import {
  getMorphoMarketPrice,
  getMorphoOracleAddress,
  getMorphoTokenPriceFromOraclePrice,
} from 'features/omni-kit/protocols/morpho-blue/helpers'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'

interface GetMorphoOraclePricesParams {
  collateralPrecision: number
  collateralPrice?: BigNumber
  collateralToken: string
  marketId: string
  networkId: OmniSupportedNetworkIds
  quotePrecision: number
  quotePrice?: BigNumber
  quoteToken: string
}

export async function getMorphoOraclePrices({
  collateralPrecision,
  collateralPrice,
  collateralToken,
  marketId,
  networkId,
  quotePrecision,
  quotePrice,
  quoteToken,
}: GetMorphoOraclePricesParams) {
  if (collateralPrice && quotePrice)
    return {
      [collateralToken]: collateralPrice,
      [quoteToken]: quotePrice,
    }
  else {
    const oracleAddress = await getMorphoOracleAddress({ marketId, networkId })
    const marketPrice = await getMorphoMarketPrice({
      collateralPrecision,
      networkId,
      oracleAddress,
      quotePrecision,
    })

    return {
      [collateralToken]: quotePrice
        ? getMorphoTokenPriceFromOraclePrice({ marketPrice, quotePrice })
        : (collateralPrice as BigNumber),
      [quoteToken]: collateralPrice
        ? getMorphoTokenPriceFromOraclePrice({ marketPrice, collateralPrice })
        : (quotePrice as BigNumber),
    }
  }
}
