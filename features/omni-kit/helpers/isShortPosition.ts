import { stablecoinTokensUpperCase } from 'features/refinance/stablecoinTokens'

export function isShortPosition({ collateralToken }: { collateralToken: string }): boolean {
  return stablecoinTokensUpperCase.includes(collateralToken.toUpperCase())
}
