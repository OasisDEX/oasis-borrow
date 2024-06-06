import { stablecoinTokensUpperCase } from 'features/refinance/stablecoinTokensUpperCase'

export function isShortPosition({ collateralToken }: { collateralToken: string }): boolean {
  return stablecoinTokensUpperCase.includes(collateralToken.toUpperCase())
}
