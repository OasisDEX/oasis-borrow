import { EmodeType } from '@summer_fi/summerfi-sdk-client'
import type { IToken } from '@summer_fi/summerfi-sdk-common'

const stablecoinTokens = [
  'ADAI',
  'AETHDAI',
  'AETHLUSD',
  'AETHPYUSD',
  'AETHSDAI',
  'AETHUSDC',
  'AETHUSDT',
  'AUSDC',
  'AUSDT',
  'CDAI',
  'CRVUSD',
  'CUSDC',
  'CUSDCV3',
  'DAI',
  'FRAX',
  'GHO',
  'GUSD',
  'LUSD',
  'PYUSD',
  'SDAI',
  'SUSD',
  'SUSDE',
  'USDC.E',
  'USDC',
  'USDE',
  'USDT',
]
const ethCorrelated = [
  'AETHCBETH',
  'AETHRETH',
  'AETHWETH',
  'AETHWSTETH',
  'ASETH',
  'AWETH',
  'AWSTETH',
  'CBETH',
  'CBETH',
  'CETH',
  'CWETHV3',
  'ETH',
  'EZETH',
  'OSETH',
  'RETH',
  'STETH',
  'WEETH',
  'WETH',
  'WSTETH',
]

export function getEmode(collateralToken: IToken, debtToken: IToken) {
  const collateralTokenSymbol = collateralToken.symbol
  const debtTokenSymbol = debtToken.symbol

  if (
    stablecoinTokens.includes(collateralTokenSymbol) &&
    stablecoinTokens.includes(debtTokenSymbol)
  ) {
    return EmodeType.Stablecoins
  } else if (
    ethCorrelated.includes(collateralTokenSymbol) &&
    ethCorrelated.includes(debtTokenSymbol)
  ) {
    return EmodeType.ETHCorrelated
  }

  return EmodeType.None
}
