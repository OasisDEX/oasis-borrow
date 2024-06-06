import { EmodeType } from '@summer_fi/summerfi-sdk-client'
import type { IToken } from '@summer_fi/summerfi-sdk-common'
import { ethCorrelatedUpperCase } from 'features/refinance/ethCorrelatedUpperCase'
import { stablecoinTokensUpperCase } from 'features/refinance/stablecoinTokensUpperCase'

export function getEmode(collateralToken: IToken, debtToken: IToken) {
  const collateralTokenSymbolUpperCase = collateralToken.symbol.toUpperCase()
  const debtTokenSymbolUpperCase = debtToken.symbol.toUpperCase()

  if (
    stablecoinTokensUpperCase.includes(collateralTokenSymbolUpperCase) &&
    stablecoinTokensUpperCase.includes(debtTokenSymbolUpperCase)
  ) {
    return EmodeType.Stablecoins
  } else if (
    ethCorrelatedUpperCase.includes(collateralTokenSymbolUpperCase) &&
    ethCorrelatedUpperCase.includes(debtTokenSymbolUpperCase)
  ) {
    return EmodeType.ETHCorrelated
  }

  return EmodeType.None
}
