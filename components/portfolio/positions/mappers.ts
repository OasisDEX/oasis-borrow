import { PortfolioProductType } from './types'
import type { LendingType, PortfolioPositionLambda } from 'lambdas/src/shared/domain-types'

export function isAvailableToMigrate(position: PortfolioPositionLambda): unknown {
  return getProductType(position) === PortfolioProductType.migrate
}

export function getProductType(position: PortfolioPositionLambda): PortfolioProductType {
  switch (position.protocol) {
    // TODO: hmm need idea for this
    case 'compound':
      return PortfolioProductType.borrow
    case 'dydx':
      return PortfolioProductType.multiply
    case 'aave':
      return PortfolioProductType.earn
    default:
      return PortfolioProductType.migrate
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
