import { EmodeType } from '@summer_fi/summerfi-sdk-client'
import type { IToken } from '@summer_fi/summerfi-sdk-common'
import { emodeEthCorrelatedTokensUpperCase } from 'features/refinance/emodeEthCorrelatedTokens'
import { emodeStablecoinTokensUpperCase } from 'features/refinance/emodeStablecoinTokens'

export function getEmode(collateralToken: IToken, debtToken: IToken) {
  const collateralTokenSymbolUpperCase = collateralToken.symbol.toUpperCase()
  const debtTokenSymbolUpperCase = debtToken.symbol.toUpperCase()

  if (
    emodeStablecoinTokensUpperCase.includes(collateralTokenSymbolUpperCase) &&
    emodeStablecoinTokensUpperCase.includes(debtTokenSymbolUpperCase)
  ) {
    return EmodeType.Stablecoins
  } else if (
    emodeEthCorrelatedTokensUpperCase.includes(collateralTokenSymbolUpperCase) &&
    emodeEthCorrelatedTokensUpperCase.includes(debtTokenSymbolUpperCase)
  ) {
    return EmodeType.ETHCorrelated
  }

  return EmodeType.None
}
