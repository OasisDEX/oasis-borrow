import { aaveV3PositionsHandler } from 'handlers/portfolio/positions/handlers/aaveV3'
import { ajnaPositionsHandler } from 'handlers/portfolio/positions/handlers/ajna'
import type { DpmList } from 'handlers/portfolio/positions/handlers/dpm'
import { getAllDpmsForWallet } from 'handlers/portfolio/positions/handlers/dpm'
import { dsrPositionsHandler } from 'handlers/portfolio/positions/handlers/dsr'
import { makerPositionsHandler } from 'handlers/portfolio/positions/handlers/maker'
import { getPositionsFromDatabase, getTokensPrices } from 'handlers/portfolio/positions/helpers'
import type { PortfolioPosition } from 'handlers/portfolio/types'
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
  const prices = await getTokensPrices()

  const dpmList = await getAllDpmsForWallet({ address })
  const positionsReply = await Promise.all([
    aaveV3PositionsHandler({ address, dpmList, apiVaults, prices }),
    ajnaPositionsHandler({ address, dpmList, apiVaults, prices }),
    dsrPositionsHandler({ address, dpmList, apiVaults, prices }),
    makerPositionsHandler({ address, dpmList, apiVaults, prices }),
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
