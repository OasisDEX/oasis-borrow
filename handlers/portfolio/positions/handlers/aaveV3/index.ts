import type { PortfolioPosition, PortfolioPositionsHandler } from 'handlers/portfolio/types'

export const aaveV3PositionsHandler: PortfolioPositionsHandler = async ({ address, dpmList }) => {
  const positions = [] as PortfolioPosition[]
  return {
    positions,
    address,
    dpmList,
  }
}
