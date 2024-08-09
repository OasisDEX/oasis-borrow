import { EmodeType } from '@summer_fi/summerfi-protocol-plugins'
import type { IToken } from '@summer_fi/summerfi-sdk-common'
import { emodeEthCorrelatedTokensUpperCase } from 'features/refinance/emodeEthCorrelatedTokens'
import { emodeStablecoinTokensSparkUpperCase } from 'features/refinance/emodeStablecoinTokens'
import { LendingProtocol } from 'lendingProtocols'

export function getEmode(collateralToken: IToken, debtToken: IToken, protocol: LendingProtocol) {
  const collateralTokenSymbolUpperCase = collateralToken.symbol.toUpperCase()
  const debtTokenSymbolUpperCase = debtToken.symbol.toUpperCase()

  // Stablecoins are disabled for aave v3
  const emodeStablecoinTokensUpperCase =
    protocol === LendingProtocol.SparkV3 ? emodeStablecoinTokensSparkUpperCase : []

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
