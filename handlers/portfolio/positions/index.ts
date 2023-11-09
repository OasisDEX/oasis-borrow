import { aaveV3PositionsHandler } from 'handlers/portfolio/positions/handlers/aaveV3'
import { ajnaPositionsHandler } from 'handlers/portfolio/positions/handlers/ajna'
import type { DpmList } from 'handlers/portfolio/positions/handlers/dpm'
import { getAllDpmsForWallet } from 'handlers/portfolio/positions/handlers/dpm'
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
  const dpmList = await getAllDpmsForWallet({ address })
  const positionsReply = await Promise.all([
    ajnaPositionsHandler({ address, dpmList }),
    aaveV3PositionsHandler({ address, dpmList }),
  ])
    .then(([{ positions: ajnaPositions }, { positions: aaveV3Positions }]) => {
      return {
        positions: [...ajnaPositions, ...aaveV3Positions],
        address: address as string,
        dpmList,
      }
    })
    .catch((error) => {
      console.error(error)
      return { positions: [], address: address as string, error: JSON.stringify(error), dpmList }
    })
  return positionsReply
}
