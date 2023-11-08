import { PortfolioProductType } from './types'
import type { LendingType, PortfolioPositionLambda } from 'lambdas/src/shared/domain-types'

export function isAvailableToMigrate(position: PortfolioPositionLambda): unknown {
  return getProductType(position) === PortfolioProductType.migrate
}

export function getProductType(position: PortfolioPositionLambda): PortfolioProductType | null {
  // TODO: hmm need idea for this
  if (position.proxyName !== 'Summer.fi') {
    return PortfolioProductType.migrate
  } else if (mapLendingType(position) === 'active') {
    return PortfolioProductType.borrow
  } else if (mapLendingType(position) === 'passive') {
    return PortfolioProductType.multiply
  } else if (mapLendingType(position) === 'loop') {
    return PortfolioProductType.earn
  } else throw new Error(`Unknown product type ${position}, should be filtered out or added.`)
}

export function mapLendingType(position: PortfolioPositionLambda): LendingType | null {
  switch (position.lendingType) {
    case 'Lending':
      // TODO Implement this
      const checkInDbIfMultiply = true
      if (checkInDbIfMultiply) {
        return 'active'
      }
      return 'passive'
    case 'Yield':
      return 'loop'
    case 'Liquidity Pool':
      return 'pool'
    case 'Staked':
      return 'staking'
    default:
      throw new Error(`Unknown lending type ${position}, should be filtered out or added.`)
  }
}
