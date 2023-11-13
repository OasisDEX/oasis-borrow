import { aaveLikePositionsHandler } from 'handlers/portfolio/positions/handlers/aave-like'
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

export const portfolioPositionsHandler = async (
  req: NextApiRequest,
): Promise<PortfolioPositionsReply> => {
  const { address } = req.query as { address: string }

  const apiVaults = await getPositionsFromDatabase({ address })
  const dpmList = await getAllDpmsForWallet({ address })
  const prices = await getCachedTokensPrices()

  if (prices) {
    const payload = {
      address,
      dpmList,
      apiVaults,
      prices: prices.data,
    }

    const positionsReply = await Promise.all([
      aaveLikePositionsHandler(payload),
      ajnaPositionsHandler(payload),
      dsrPositionsHandler(payload),
      makerPositionsHandler(payload),
    ])
      .then(
        ([
          { positions: aaveV3Positions },
          { positions: ajnaPositions },
          { positions: dsrPositions },
          { positions: makerPositions },
        ]) => {
          return {
            positions: [...aaveV3Positions, ...ajnaPositions, ...dsrPositions, ...makerPositions],
          }
        },
      )
      .catch((error) => {
        console.error(error)
        return { positions: [], address, error: JSON.stringify(error), dpmList }
      })

    return positionsReply
  } else {
    return {
      positions: [],
      error: 'Unable to load token prices',
    }
  }
}
