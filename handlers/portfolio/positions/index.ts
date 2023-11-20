import { aaveLikePositionsHandler } from 'handlers/portfolio/positions/handlers/aave-like'
import { aaveV2PositionHandler } from 'handlers/portfolio/positions/handlers/aave-v2'
import { ajnaPositionsHandler } from 'handlers/portfolio/positions/handlers/ajna'
import { dsrPositionsHandler } from 'handlers/portfolio/positions/handlers/dsr'
import { makerPositionsHandler } from 'handlers/portfolio/positions/handlers/maker'
import { getPositionsFromDatabase, getTokensPrices } from 'handlers/portfolio/positions/helpers'
import { getAllDpmsForWallet } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import type {
  PortfolioPositionsCountReply,
  PortfolioPositionsReply,
} from 'handlers/portfolio/types'
import { cacheObject } from 'helpers/api/cacheObject'
import type { NextApiRequest } from 'next'
import NodeCache from 'node-cache'

const portfolioCacheTime = 2 * 60
export const getCachedTokensPrices = cacheObject(
  getTokensPrices,
  portfolioCacheTime,
  'portfolio-prices',
)
const portfolioCache = new NodeCache({ stdTTL: portfolioCacheTime })

export const portfolioPositionsHandler = async ({
  query,
}: NextApiRequest): Promise<PortfolioPositionsReply | PortfolioPositionsCountReply> => {
  const address = (query.address as string).toLowerCase()
  const debug = 'debug' in query
  const positionsCount = 'positionsCount' in query
  if (portfolioCache.has(address)) {
    if (positionsCount) {
      const { positions, ...rest } = JSON.parse(
        portfolioCache.get(address) as string,
      ) as PortfolioPositionsReply
      return {
        positions: positions.map(({ positionId }) => ({ positionId: positionId.toString() })),
        ...rest,
      }
    }
    return JSON.parse(portfolioCache.get(address) as string)
  }

  const prices = await getCachedTokensPrices()

  if (prices) {
    const apiVaults = !positionsCount ? await getPositionsFromDatabase({ address }) : undefined
    const dpmList = await getAllDpmsForWallet({ address })

    const payload = {
      address,
      apiVaults,
      dpmList,
      prices: prices.data,
      positionsCount,
    }

    const positionsReply = await Promise.all([
      aaveLikePositionsHandler(payload),
      aaveV2PositionHandler(payload),
      ajnaPositionsHandler(payload),
      dsrPositionsHandler(payload),
      makerPositionsHandler(payload),
    ])
      .then(
        ([
          { positions: aaveLikePositions },
          { positions: aaveV2Positions },
          { positions: ajnaPositions },
          { positions: dsrPositions },
          { positions: makerPositions },
        ]) => ({
          positions: [
            ...aaveLikePositions,
            ...aaveV2Positions,
            ...ajnaPositions,
            ...dsrPositions,
            ...makerPositions,
          ],
          error: false,
          errorJson: false,
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

    if (!positionsReply.error && !positionsCount) {
      portfolioCache.set(address, JSON.stringify(positionsReply))
    }

    return positionsReply
  } else {
    return {
      positions: [],
      ...(debug && { error: 'Unable to load token prices' }),
    }
  }
}
