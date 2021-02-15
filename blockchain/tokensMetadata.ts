import { keyBy } from 'lodash'

export interface TokenConfig {
  symbol: string
  precision: number
  digits: number
  maxSell: string
  name: string
  icon: string
  iconCircle: string
  iconColor: string
  ticker: string
}

const tokens = [
  {
    symbol: 'ETH',
    precision: 18,
    digits: 5,
    maxSell: '10000000',
    name: 'Ether',
    icon: 'ether',
    iconCircle: 'ether_circle_color',
    iconColor: 'ether_color',
    ticker: 'eth-ethereum',
    coinbaseTicker: 'eth-usdc',
    color: '#667FE3',
    background: 'linear-gradient(284.73deg, #9658D3 3.42%, #415FFF 97.28%)',
  },
  {
    symbol: 'BAT',
    precision: 18,
    digits: 5,
    // maxSell: ___________,
    name: 'Basic Attention Token',
    icon: 'bat',
    iconCircle: 'bat_circle_color',
    iconColor: 'bat_color',
    // ticker: ___________,
    // coinbaseTicker: ___________,
    color: '#ff4625',
  },
  {
    symbol: 'WBTC',
    precision: 8,
    digits: 5,
    digitsInstant: 3,
    safeCollRatio: 1.5,
    maxSell: '1000000000000000',
    name: 'Wrapped Bitcoin',
    icon: 'wbtc',
    iconCircle: 'wbtc_color',
    iconColor: 'wbtc_color',
    ticker: 'wbtc-wrapped-bitcoin',
    color: "#f09242"
  },
  {
    symbol: 'TUSD',
    precision: 18,
    digits: 2,
    // maxSell: ___________,
    name: 'Trust token',
    icon: 'tusd',
    iconCircle: 'tusd_circle_color',
    iconColor: 'tusd_color',
    // ticker: ___________,
    // coinbaseTicker: ___________,
    color: "#195aff"
  },
  {
    symbol: 'KNC',
    precision: 18,
    digits: 5,
    // maxSell: ___________,
    name: 'Kyber Network',
    icon: 'kyber',
    iconCircle: 'kyber_circle_color',
    iconColor: 'kyber_color',
    // ticker: ___________,
    // coinbaseTicker: ___________,
    color: '#30cb9e',
  },
  {
    symbol: 'MANA',
    precision: 18,
    digits: 5,
    // maxSell: ___________,
    name: 'Decentraland',
    icon: 'mana',
    iconCircle: 'mana_circle_color',
    iconColor: 'mana_color',
    // ticker: ___________,
    // coinbaseTicker: ___________,
    color: '#f05'
  },
  {
    symbol: 'PAXUSD',
    precision: 18,
    digits: 2,
    // maxSell: ___________,
    name: 'Paxos Standard',
    icon: 'pax',
    iconCircle: 'pax_circle_color',
    iconColor: 'pax_color',
    // ticker: ___________,
    // coinbaseTicker: ___________,
    color: '#005121'
  },
  {
    symbol: 'USDT',
    precision: 6,
    digits: 2,
    // maxSell: ___________,
    name: 'Tether',
    icon: 'usdt',
    iconCircle: 'usdt_circle_color',
    iconColor: 'usdt_color',
    // ticker: ___________,
    // coinbaseTicker: ___________,
    color: '259c77',
  },
  {
    symbol: 'COMP',
    precision: 18,
    digits: 5,
    // maxSell: ___________,
    name: 'Compound',
    icon: 'compound',
    color: '#00D395',
    background: 'linear-gradient(290.37deg, #4BCFA8 0%, #139D8D 96.14%)',
    iconCircle: 'compound_circle_color',
    iconColor: 'compound_color',
    // ticker: ___________,
    // coinbaseTicker: ___________,
  },
  {
    symbol: 'LRC',
    precision: 18,
    digits: 5,
    // maxSell: ___________,
    name: 'Loopring',
    icon: 'lrc',
    iconCircle: 'lrc_circle_color',
    iconColor: 'lrc_color',
    // ticker: ___________,
    // coinbaseTicker: ___________,
    color: '#1c60ff'
  },
  {
    symbol: 'LINK',
    precision: 18,
    digits: 5,
    // maxSell: ___________,
    name: 'Chainlink',
    icon: 'chainlink',
    iconCircle: 'chainlink_circle_color',
    iconColor: 'chainlink_color',
    // ticker: ___________,
    // coinbaseTicker: ___________,
    color: '#375bd2',
    background: 'linear-gradient(90deg, #3C5FCB 0%, #0E319D 100%), #C4C4C4',
  },
  {
    symbol: 'GUSD',
    precision: 2,
    digits: 2,
    // maxSell: ___________,
    name: 'Gemini dollar',
    icon: 'gemini',
    iconCircle: 'gemini_circle_color',
    iconColor: 'gemini_color',
    // ticker: ___________,
    // coinbaseTicker: ___________,
    // background: 'linear-gradient(90deg, #2FB1C8 0%, #69DCF6 100%), #C4C4C4',
    color: '#25ddfb',
  },
  {
    symbol: 'ZRX',
    precision: 18,
    digits: 5,
    // maxSell: ___________,
    name: '0x',
    icon: 'zerox',
    iconCircle: 'zerox_circle_color',
    iconColor: 'zerox_color',
    // ticker: ___________,
    // coinbaseTicker: ___________,
    color: '#000'
  },
  {
    symbol: 'USDC',
    precision: 6,
    digits: 6,
    digitsInstant: 2,
    maxSell: '1000000000000000',
    name: 'USD Coin',
    icon: 'usdc',
    iconCircle: 'usdc_circle_color',
    iconColor: 'usdc_circle_color',
    ticker: 'usdc-usd-coin',
    color: '#2775ca',
  },
  {
    symbol: 'BAL',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    // maxSell: ______,
    name: 'Balancer',
    icon: 'usdc',
    iconCircle: 'close_squared', // MISSING
    iconColor: 'close_squared', // MISSING
    // ticker: 'usdc-usd-coin',
    color: '#000'
  },
  {
    symbol: 'YFI',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    // maxSell: ______,
    name: 'Yearn',
    icon: 'usdc',
    iconCircle: 'close_squared', // MISSING
    iconColor: 'close_squared', // MISSING
    // ticker: 'usdc-usd-coin',
    color: '#0657f9',
  },
  // {
  //   symbol: 'WETH',
  //   precision: 18,
  //   digits: 5,
  //   maxSell: '10000000',
  //   name: 'Wrapped Ether',
  //   icon: AvatarSimple(ethSvg),
  //   // iconInverse: AvatarSimple(ethCircleSvg),
  //   iconCircle: AvatarSimple(ethCircleSvg),
  //   iconColor: AvatarSimple(ethCircleSvg),
  //   ticker: 'eth-ethereum',
  // },
  {
    symbol: 'DAI',
    precision: 18,
    digits: 4,
    maxSell: '10000000',
    name: 'Dai',
    icon: 'dai',
    iconCircle: 'dai_circle_color',
    iconColor: 'dai_color',
    ticker: 'dai-dai',
    coinbaseTicker: 'dai-usdc',
    color: '#fdc134'
  },
  // {

  // },
  // {
  //   symbol: 'CHAI',
  //   precision: 18,
  //   digits: 4,
  //   maxSell: '10000000',
  //   name: 'Maker',
  //   icon: AvatarSimple(mkrSvg),
  //   iconCircle: AvatarSimple(mkrSvg),
  //   iconColor: AvatarSimple(mkrSvg),
  //   ticker: '',
  // },
  // {
  //   symbol: 'MKR',
  //   precision: 18,
  //   digits: 4,
  //   maxSell: '10000000',
  //   name: 'Maker',
  //   icon: AvatarSimple(mkrSvg),
  //   iconCircle: AvatarSimple(mkrSvg),
  //   iconColor: AvatarSimple(mkrSvg),
  //   ticker: 'usdc-usd-coin',
  // },
]

// ticker comes from coinpaprika api https://api.coinpaprika.com/v1/tickers
const tokensBySymbol = keyBy(tokens, 'symbol')

export function getToken(tokenSymbol: string) {
  if (!tokensBySymbol[tokenSymbol]) {
    console.warn('No token metadata for', tokenSymbol, 'using WETH!')
    return tokensBySymbol.ETH
  }
  return tokensBySymbol[tokenSymbol]
}
