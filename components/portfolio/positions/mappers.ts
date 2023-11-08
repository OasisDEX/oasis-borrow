import type { PortfolioProductType } from './types'
import type { PortfolioPositionLambda } from 'lambdas/src/shared/domain-types'

export function isAvailableToMigrate(position: PortfolioPositionLambda): unknown {
  throw new Error('Function not implemented.')
}

export function getProductType(position: PortfolioPositionLambda): PortfolioProductType {
  throw new Error('Function not implemented.')
}
