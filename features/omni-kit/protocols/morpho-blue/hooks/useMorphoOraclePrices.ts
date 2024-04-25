import type { Tickers } from 'blockchain/prices.types'
import {
  getMorphoMarketPrice,
  getMorphoOracleAddress,
  getMorphoTokenPriceFromOraclePrice,
} from 'features/omni-kit/protocols/morpho-blue/helpers'
import { morphoMarkets } from 'features/omni-kit/protocols/morpho-blue/settings'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { useEffect, useState } from 'react'

interface MorphoOraclePricesProps {
  collateralPrecision?: number
  collateralToken?: string
  networkId: OmniSupportedNetworkIds
  pairId: number
  quotePrecision?: number
  quoteToken?: string
  tokenPriceUSDData?: Tickers
}

export function useMorphoOraclePrices({
  collateralPrecision,
  collateralToken,
  networkId,
  pairId,
  quotePrecision,
  quoteToken,
  tokenPriceUSDData,
}: MorphoOraclePricesProps) {
  const [oraclePrices, setOraclePrices] = useState<Tickers | undefined>(tokenPriceUSDData)

  const marketId = morphoMarkets[networkId]?.[`${collateralToken}-${quoteToken}`]?.[pairId - 1]

  useEffect(() => {
    if (
      collateralToken &&
      quoteToken &&
      collateralPrecision &&
      quotePrecision &&
      tokenPriceUSDData &&
      marketId
    ) {
      if (!tokenPriceUSDData[collateralToken] || !tokenPriceUSDData[quoteToken])
        void getMorphoOracleAddress({ marketId, networkId })
          .then((oracleAddress) => {
            return getMorphoMarketPrice({
              collateralPrecision,
              networkId,
              oracleAddress,
              quotePrecision,
            })
          })
          .then((price) => {
            setOraclePrices({
              ...tokenPriceUSDData,
              ...(tokenPriceUSDData[collateralToken] && {
                [quoteToken]: getMorphoTokenPriceFromOraclePrice({
                  marketPrice: price,
                  collateralPrice: tokenPriceUSDData[collateralToken],
                }),
              }),
              ...(tokenPriceUSDData[quoteToken] && {
                [collateralToken]: getMorphoTokenPriceFromOraclePrice({
                  marketPrice: price,
                  quotePrice: tokenPriceUSDData[quoteToken],
                }),
              }),
            })
          })
      else setOraclePrices(tokenPriceUSDData)
    } else setOraclePrices(tokenPriceUSDData)
  }, [
    collateralPrecision,
    collateralToken,
    marketId,
    networkId,
    quotePrecision,
    quoteToken,
    tokenPriceUSDData,
  ])

  return oraclePrices
}
