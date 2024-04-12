import { EmodeType } from 'features/refinance/types'
import type { TokenAmount } from 'summerfi-sdk-common'

const stablecoinTokens = ['USDT', 'USDC', 'DAI']
const ETHCorrelated = ['ETH', 'WETH', 'WSTETH']

export function getEmode(collateralTokenData: TokenAmount, debtTokenData: TokenAmount) {
  if (
    stablecoinTokens.includes(collateralTokenData.token.symbol) &&
    stablecoinTokens.includes(debtTokenData.token.symbol)
  ) {
    return EmodeType.Stablecoins
  } else if (
    ETHCorrelated.includes(collateralTokenData.token.symbol) &&
    ETHCorrelated.includes(debtTokenData.token.symbol)
  ) {
    return EmodeType.ETHCorrelated
  }

  return EmodeType.None
}
