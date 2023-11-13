import { aaveLikePositionsHandler } from 'handlers/portfolio/positions/handlers/aave-like'
import { aaveV2PositionHandler } from 'handlers/portfolio/positions/handlers/aave-v2'
import { ajnaPositionsHandler } from 'handlers/portfolio/positions/handlers/ajna'
import { dsrPositionsHandler } from 'handlers/portfolio/positions/handlers/dsr'
import { makerPositionsHandler } from 'handlers/portfolio/positions/handlers/maker'
import { getPositionsFromDatabase, getTokensPrices } from 'handlers/portfolio/positions/helpers'
import { getAllDpmsForWallet } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { cacheObject } from 'helpers/api/cacheObject'
import type { NextApiRequest } from 'next'

type PortfolioPositionsReply = {
  positions: PortfolioPosition[]
  error?: string
}

export const getCachedTokensPrices = cacheObject(getTokensPrices, 2 * 60, 'portfolio-prices')

export const portfolioPositionsHandler = async ({
  query,
}: NextApiRequest): Promise<PortfolioPositionsReply> => {
  const address = query.address as string
  const debug = 'debug' in query

  const prices = await getCachedTokensPrices()

  if (prices) {
    const apiVaults = await getPositionsFromDatabase({ address })
    const dpmList = await getAllDpmsForWallet({ address })

    const payload = {
      address,
      apiVaults,
      dpmList,
      prices: prices.data,
    }

    const positionsReply = await Promise.all([
      aaveLikePositionsHandler(payload),
      ajnaPositionsHandler(payload),
      dsrPositionsHandler(payload),
      makerPositionsHandler(payload),
      aaveV2PositionHandler(payload),
    ])
      .then(
        ([
          { positions: aaveV3Positions },
          { positions: ajnaPositions },
          { positions: dsrPositions },
          { positions: makerPositions },
          { positions: aaveV2Positions },
        ]) => ({
          positions: [
            ...aaveV2Positions,
            ...aaveV3Positions,
            ...ajnaPositions,
            ...dsrPositions,
            ...makerPositions,
          ],
          ...(debug && { ...payload }),
        }),
      )
      .catch((error) => {
        console.error(error)

        return {
          positions: [],
          ...(debug && { ...payload, error: error.toString(), errorJson: JSON.stringify(error) }),
        }
      })

    return positionsReply
  } else {
    return {
      positions: [],
      ...(debug && { error: 'Unable to load token prices' }),
    }
  }
}
