import type { PortfolioPosition } from 'handlers/portfolio/types'

export const ajnaPositionsHandler = async ({ address }: { address: string }) => {
  const positions = [] as PortfolioPosition[]
  address // type safety lol
  return positions
}
