import BigNumber from 'bignumber.js'
import type { Tickers } from 'blockchain/prices.types'
import { aaveV3PositionsHandler } from 'handlers/portfolio/positions/handlers/aaveV3'
import { ajnaPositionsHandler } from 'handlers/portfolio/positions/handlers/ajna'
import type { DpmList } from 'handlers/portfolio/positions/handlers/dpm'
import { getAllDpmsForWallet } from 'handlers/portfolio/positions/handlers/dpm'
import { dsrPositionsHandler } from 'handlers/portfolio/positions/handlers/dsr'
import { makerPositionsHandler } from 'handlers/portfolio/positions/handlers/maker'
import { getPositionsFromDatabase } from 'handlers/portfolio/positions/helpers'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { tokenTickers } from 'helpers/api/tokenTickers'
import type { NextApiRequest } from 'next'

type PortfolioPositionsReply = {
  positions: PortfolioPosition[]
  address: string
  error?: string
  dpmList: DpmList
}

export const portfolioPositionsHandler = async (
  req: NextApiRequest,
): Promise<PortfolioPositionsReply> => {
  const { address } = req.query as { address: string }

  const apiVaults = await getPositionsFromDatabase({ address })
  const tickersResponse = await tokenTickers()
  const tickers = Object.entries(tickersResponse).reduce<Tickers>(
    (acc, [key, value]) => ({
      ...acc,
      [key.toLowerCase()]: new BigNumber(value),
    }),
    {},
  )

  const dpmList = await getAllDpmsForWallet({ address })
  const positionsReply = await Promise.all([
    aaveV3PositionsHandler({ address, dpmList, apiVaults, tickers }),
    ajnaPositionsHandler({ address, dpmList, apiVaults, tickers }),
    dsrPositionsHandler({ address, dpmList, apiVaults, tickers }),
    makerPositionsHandler({ address, dpmList, apiVaults, tickers }),
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
          address: address as string,
          dpmList,
        }
      },
    )
    .catch((error) => {
      console.error(error)
      return { positions: [], address: address as string, error: JSON.stringify(error), dpmList }
    })

  return positionsReply
}
