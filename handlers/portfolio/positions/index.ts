import BigNumber from 'bignumber.js'
import type { Tickers } from 'blockchain/prices.types'
import { aaveV3PositionsHandler } from 'handlers/portfolio/positions/handlers/aaveV3'
import { ajnaPositionsHandler } from 'handlers/portfolio/positions/handlers/ajna'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { tokenTickers } from 'helpers/api/tokenTickers'
import type { NextApiRequest } from 'next'

export const portfolioPositionsHandler = async (
  req: NextApiRequest,
): Promise<{ positions: PortfolioPosition[]; address: string; error?: string }> => {
  const tickersResponse = await tokenTickers()
  const tickers = Object.entries(tickersResponse).reduce<Tickers>(
    (acc, [key, value]) => ({
      ...acc,
      [key.toLowerCase()]: new BigNumber(value),
    }),
    {},
  )

  const { address } = req.query as { address: string }
  const positionsReply = await Promise.all([
    ajnaPositionsHandler({ address, tickers }),
    aaveV3PositionsHandler({ address, tickers }),
  ])
    .then(([{ positions: ajnaPositions }, { positions: aaveV3Positions }]) => {
      return { positions: [...ajnaPositions, ...aaveV3Positions], address: address as string }
    })
    .catch((error) => {
      console.error(error)
      return { positions: [], address: address as string, error: JSON.stringify(error) }
    })

  return positionsReply
}
