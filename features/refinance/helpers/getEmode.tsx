import { EmodeType } from 'features/refinance/types'
import type { TokenAmount } from 'summerfi-sdk-common'

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

export function getEmode(collateralTokenData: TokenAmount, debtTokenData: TokenAmount) {
  const collateralToken = collateralTokenData.token.symbol
  const debtToken = debtTokenData.token.symbol

  if (stablecoinTokens.includes(collateralToken) && stablecoinTokens.includes(debtToken)) {
    return EmodeType.Stablecoins
  } else if (ethCorrelated.includes(collateralToken) && ethCorrelated.includes(debtToken)) {
    return EmodeType.ETHCorrelated
  }

  return EmodeType.None
}
