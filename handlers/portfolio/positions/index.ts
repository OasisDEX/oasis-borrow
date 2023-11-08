import type { PortfolioPosition } from 'handlers/portfolio/types'
import type { NextApiRequest } from 'next'

export const portfolioPositionsHandler = async (
  req: NextApiRequest,
): Promise<{ positions: PortfolioPosition[]; address: string }> => {
  const { address } = req.query
  console.log('portfolioPositionsHandler address', address)
  const positions = {} as PortfolioPosition[]
  return { positions, address: address as string }
}
