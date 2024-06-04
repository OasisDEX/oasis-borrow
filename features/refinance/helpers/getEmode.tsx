import { EmodeType } from '@summer_fi/summerfi-sdk-client'
import type { IToken } from '@summer_fi/summerfi-sdk-common'

const stablecoinTokensUpperCase = [
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
const ethCorrelatedUpperCase = [
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
