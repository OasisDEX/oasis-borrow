import type { PortfolioProductType } from './types'
import type { LendingType, PortfolioPositionLambda } from 'lambdas/src/shared/domain-types'

export function isAvailableToMigrate(position: PortfolioPositionLambda): unknown {
  return position.lendingType
}

export function getProductType(position: PortfolioPositionLambda): PortfolioProductType {
  switch (position.protocol) {
    case 'compound':
      return 'lending'
    case 'dydx':
      return 'lending'
    case 'aave':
      return 'lending'
    default:
      return 'migrate'
  }
}

export function mapLendingType(position: PortfolioPositionLambda): LendingType | null {
  switch (position.lendingType) {
    case 'Lending':
      return 'active'
    case 'Yield':
      return 'loop'
    case 'Deposit':
      return 'passive'
    case 'Liquidity Pool':
      return 'pool'
    case 'Staked':
      return 'staking'
    default:
      return null
  }
}
