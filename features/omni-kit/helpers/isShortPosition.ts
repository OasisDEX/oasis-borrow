import { stablecoinTokensUpperCase } from 'features/refinance/helpers/getEmode'

export function isShortPosition({ collateralToken }: { collateralToken: string }): boolean {
  return stablecoinTokensUpperCase.includes(collateralToken.toUpperCase())
}
