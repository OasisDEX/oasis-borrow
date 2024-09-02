import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import { makerMarkets } from 'features/omni-kit/protocols/maker/settings'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { useEffect, useState } from 'react'

interface MakerOraclePricesProps {
  collateralPrecision?: number
  collateralToken?: string
  networkId: OmniSupportedNetworkIds
  pairId: number
  quotePrecision?: number
  quoteToken?: string
  tokenPriceUSDData?: Tickers
}

export function useMakerOraclePrices({
  collateralToken,
  networkId,
  pairId,
  quoteToken,
  tokenPriceUSDData,
}: MakerOraclePricesProps) {
  const [oraclePrices, setOraclePrices] = useState<
    { current: Tickers; next: Tickers } | undefined
  >()

  const ilkId = makerMarkets[networkId]?.[`${collateralToken}-${quoteToken}`]?.[pairId - 1]

  useEffect(() => {
    const fetchData = async () => {
      if (ilkId && tokenPriceUSDData && collateralToken && quoteToken) {
        const { response } = (await loadSubgraph({
          subgraph: 'Discover',
          method: 'getMakerOracle',
          networkId: NetworkIds.MAINNET,
          params: {
            ilkId,
          },
        })) as SubgraphsResponses['Discover']['getMakerOracle']

        const currentTokenOracle = new BigNumber(response.collateralTypes[0].pip.value)
        const nextTokenOracle = new BigNumber(response.collateralTypes[0].pip.next)

        setOraclePrices({
          current: {
            [collateralToken]: currentTokenOracle,
            // quote token in maker v1 is always DAI
            [quoteToken]: tokenPriceUSDData[quoteToken],
          },
          next: {
            [collateralToken]: nextTokenOracle,
            // quote token in maker v1 is always DAI
            [quoteToken]: tokenPriceUSDData[quoteToken],
          },
        })
      }
    }

    void fetchData()
  }, [ilkId, tokenPriceUSDData, collateralToken, quoteToken])

  return oraclePrices
}
