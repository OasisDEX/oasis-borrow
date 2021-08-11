import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { keyBy } from 'lodash'
import type { ElementOf } from 'ts-essentials'

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
  tags: CoinTag[]
  color: string
  bannerIcon: string
}

export const COIN_TAGS = ['stablecoin', 'lp-token'] as const
export type CoinTag = ElementOf<typeof COIN_TAGS>

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
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 100%), linear-gradient(284.73deg, #C993FF 3.42%, #4962E1 97.28%), linear-gradient(284.73deg, #9658D3 3.42%, #415FFF 97.28%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/eth.svg'),
    tags: [],
  },
  {
    symbol: 'BAT',
    precision: 18,
    digits: 5,
    name: 'Basic Attention Token',
    icon: 'bat',
    iconCircle: 'bat_circle_color',
    iconColor: 'bat_color',
    color: '#ff4625',
    background: 'linear-gradient(133.6deg, #F75E18 21.52%, #F48C5C 98.44%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/bat.svg'),
    tags: [],
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
    iconCircle: 'wbtc_circle_color',
    iconColor: 'wbtc_circle_color',
    ticker: 'wbtc-wrapped-bitcoin',
    color: '#f09242',
    background: 'linear-gradient(147.66deg, #F48702 0%, #FEA013 88.25%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/wbtc.svg'),
    tags: [],
  },
  {
    symbol: 'RENBTC',
    precision: 8,
    digits: 5,
    digitsInstant: 3,
    safeCollRatio: 1.5,
    maxSell: '1000000000000000',
    name: 'renBTC',
    icon: 'renbtc',
    iconCircle: 'renbtc_circle_color',
    iconColor: 'renbtc_circle_color',
    ticker: 'renbtc-renbtc',
    color: '#838489',
    background: 'linear-gradient(156.14deg, #222121 12.76%, #8E8E8E 93.58%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/renbtc.svg'),
    tags: [],
  },
  {
    symbol: 'TUSD',
    precision: 18,
    digits: 2,
    name: 'Trust token',
    icon: 'tusd',
    iconCircle: 'tusd_circle_color',
    iconColor: 'tusd_color',
    color: '#195aff',
    background: 'linear-gradient(145.44deg, #0060CD 17.44%, #6AADFA 91.11%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/tusd.svg'),
    tags: ['stablecoin'],
  },
  {
    symbol: 'KNC',
    precision: 18,
    digits: 5,
    name: 'Kyber Network',
    icon: 'kyber',
    iconCircle: 'kyber_circle_color',
    iconColor: 'kyber_color',
    color: '#30cb9e',
    background: 'linear-gradient(141.71deg, #00AF87 17.09%, #1ACCA4 81.72%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/knc.svg'),
    tags: [],
  },
  {
    symbol: 'MANA',
    precision: 18,
    digits: 5,
    name: 'Decentraland',
    icon: 'mana',
    iconCircle: 'mana_circle_color',
    iconColor: 'mana_color',
    color: '#f05',
    background: 'linear-gradient(285.4deg, #FFBC5B 1.26%, #FF2D55 100%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/mana.svg'),
    tags: [],
  },
  {
    symbol: 'PAXUSD',
    precision: 18,
    digits: 2,
    name: 'Paxos Standard',
    icon: 'pax',
    iconCircle: 'pax_circle_color',
    iconColor: 'pax_color',
    color: '#005121',
    background: 'linear-gradient(143.13deg, #0B9F74 12.24%, #64DFBB 85.9%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/pax.svg'),
    tags: ['stablecoin'],
  },
  {
    symbol: 'USDT',
    precision: 6,
    digits: 2,
    name: 'Tether',
    icon: 'usdt',
    iconCircle: 'usdt_circle_color',
    iconColor: 'usdt_color',
    color: '259c77',
    background: 'linear-gradient(152.36deg, #25A680 17.19%, #66C5A9 95.07%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/usdt.svg'),
    tags: ['stablecoin'],
  },
  {
    symbol: 'COMP',
    precision: 18,
    digits: 5,
    name: 'Compound',
    icon: 'compound',
    iconCircle: 'compound_circle_color',
    iconColor: 'compound_color',
    color: '#00D395',
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 100%), linear-gradient(290.37deg, #54D8B1 0%, #2DAA7D 96.14%), linear-gradient(290.37deg, #4BCFA8 0%, #139D8D 96.14%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/comp.svg'),
    tags: [],
  },
  {
    symbol: 'LRC',
    precision: 18,
    digits: 5,
    name: 'Loopring',
    icon: 'lrc',
    iconCircle: 'lrc_circle_color',
    iconColor: 'lrc_color',
    color: '#1c60ff',
    background: 'linear-gradient(143.13deg, #3758FD 17.87%, #A1ADEA 91.53%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/lrc.svg'),
    tags: [],
  },
  {
    symbol: 'LINK',
    precision: 18,
    digits: 5,
    name: 'Chainlink',
    icon: 'chainlink',
    iconCircle: 'chainlink_circle_color',
    iconColor: 'chainlink_color',
    color: '#375bd2',
    background: 'linear-gradient(141.5deg, #164BE1 14.6%, #8DA6EC 89.62%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/link.svg'),
    tags: [],
  },
  {
    symbol: 'GUSD',
    precision: 2,
    digits: 2,
    name: 'Gemini dollar',
    icon: 'gemini',
    iconCircle: 'gemini_circle_color',
    iconColor: 'gemini_color',
    color: '#25ddfb',
    background: 'linear-gradient(144.58deg, #00B4CC 15.16%, #93E9F4 89.41%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/gusd.svg'),
    tags: ['stablecoin'],
  },
  {
    symbol: 'ZRX',
    precision: 18,
    digits: 5,
    name: '0x',
    icon: 'zerox',
    iconCircle: 'zerox_circle_color',
    iconColor: 'zerox_color',
    color: '#000',
    background: 'linear-gradient(156.14deg, #222121 12.76%, #8E8E8E 93.58%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/zerox.svg'),
    tags: [],
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
    background: 'linear-gradient(152.45deg, #0666CE 8.53%, #61A9F8 91.7%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/usdc.svg'),
    tags: ['stablecoin'],
  },
  {
    symbol: 'BAL',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'Balancer',
    icon: 'usdc',
    iconCircle: 'bal_circle',
    iconColor: 'bal_circle_color',
    color: '#000',
    background: 'linear-gradient(156.14deg, #222121 12.76%, #8E8E8E 93.58%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/bal.svg'),
    tags: [],
  },
  {
    symbol: 'YFI',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'Yearn',
    icon: 'usdc',
    iconCircle: 'yfi_circle_color',
    iconColor: 'yfi_circle_color',
    color: '#0657f9',
    background: 'linear-gradient(145.44deg, #0060CD 17.44%, #6AADFA 91.11%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/yfi.svg'),
    tags: [],
  },
  {
    symbol: 'UNI',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'Uniswap',
    icon: 'uni_circle_color',
    iconCircle: 'uni_circle_color',
    iconColor: 'uni_circle_color',
    color: '#ff077d',
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 100%), linear-gradient(99.1deg, #FA46A7 0%, #FF599F 95.28%), linear-gradient(99.1deg, #FF077D 0%, #FF5B79 95.28%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/uni.svg'),
    tags: [],
  },
  {
    symbol: 'AAVE',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'Aave',
    icon: 'aave_circle_color',
    iconCircle: 'aave_circle_color',
    iconColor: 'aave_circle_color',
    color: '#ff077d',
    background: 'linear-gradient(286.73deg, #B6509E 2.03%, #2EBAC6 100%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/aave.svg'),
    tags: [],
  },
  {
    symbol: 'UNIV2USDCETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2USDCETH',
    icon: 'uni_circle_color',
    iconCircle: 'uni_circle_color',
    iconColor: 'uni_circle_color',
    color: '#ff077d',
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 100%), linear-gradient(99.1deg, #FA46A7 0%, #FF599F 95.28%), linear-gradient(99.1deg, #FF077D 0%, #FF5B79 95.28%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/uni.svg'),
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2DAIUSDC',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2DAIUSDC',
    icon: 'uni_circle_color',
    iconCircle: 'uni_circle_color',
    iconColor: 'uni_circle_color',
    color: '#ff077d',
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 100%), linear-gradient(99.1deg, #FA46A7 0%, #FF599F 95.28%), linear-gradient(99.1deg, #FF077D 0%, #FF5B79 95.28%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/uni.svg'),
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2WBTCETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2WBTCETH',
    icon: 'uni_circle_color',
    iconCircle: 'uni_circle_color',
    iconColor: 'uni_circle_color',
    color: '#ff077d',
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 100%), linear-gradient(99.1deg, #FA46A7 0%, #FF599F 95.28%), linear-gradient(99.1deg, #FF077D 0%, #FF5B79 95.28%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/uni.svg'),
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2DAIETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2DAIETH',
    icon: 'uni_circle_color',
    iconCircle: 'uni_circle_color',
    iconColor: 'uni_circle_color',
    color: '#ff077d',
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 100%), linear-gradient(99.1deg, #FA46A7 0%, #FF599F 95.28%), linear-gradient(99.1deg, #FF077D 0%, #FF5B79 95.28%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/uni.svg'),
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2ETHUSDT',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2ETHUSDT',
    icon: 'uni_circle_color',
    iconCircle: 'uni_circle_color',
    iconColor: 'uni_circle_color',
    color: '#ff077d',
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 100%), linear-gradient(99.1deg, #FA46A7 0%, #FF599F 95.28%), linear-gradient(99.1deg, #FF077D 0%, #FF5B79 95.28%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/uni.svg'),
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2UNIETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2UNIETH',
    icon: 'uni_circle_color',
    iconCircle: 'uni_circle_color',
    iconColor: 'uni_circle_color',
    color: '#ff077d',
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 100%), linear-gradient(99.1deg, #FA46A7 0%, #FF599F 95.28%), linear-gradient(99.1deg, #FF077D 0%, #FF5B79 95.28%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/uni.svg'),
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2LINKETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2LINKETH',
    icon: 'uni_circle_color',
    iconCircle: 'uni_circle_color',
    iconColor: 'uni_circle_color',
    color: '#ff077d',
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 100%), linear-gradient(99.1deg, #FA46A7 0%, #FF599F 95.28%), linear-gradient(99.1deg, #FF077D 0%, #FF5B79 95.28%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/uni.svg'),
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2WBTCDAI',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2WBTCDAI',
    icon: 'uni_circle_color',
    iconCircle: 'uni_circle_color',
    iconColor: 'uni_circle_color',
    color: '#ff077d',
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 100%), linear-gradient(99.1deg, #FA46A7 0%, #FF599F 95.28%), linear-gradient(99.1deg, #FF077D 0%, #FF5B79 95.28%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/uni.svg'),
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2AAVEETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2AAVEETH',
    icon: 'uni_circle_color',
    iconCircle: 'uni_circle_color',
    iconColor: 'uni_circle_color',
    color: '#ff077d',
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 100%), linear-gradient(99.1deg, #FA46A7 0%, #FF599F 95.28%), linear-gradient(99.1deg, #FF077D 0%, #FF5B79 95.28%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/uni.svg'),
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2DAIUSDT',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2DAIUSDT',
    icon: 'uni_circle_color',
    iconCircle: 'uni_circle_color',
    iconColor: 'uni_circle_color',
    color: '#ff077d',
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 100%), linear-gradient(99.1deg, #FA46A7 0%, #FF599F 95.28%), linear-gradient(99.1deg, #FF077D 0%, #FF5B79 95.28%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/uni.svg'),
    tags: ['lp-token'],
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
    color: '#fdc134',
    tags: ['stablecoin'],
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
    throw new Error(`No meta information for token: ${tokenSymbol}`)
  }
  return tokensBySymbol[tokenSymbol]
}

export const ALLOWED_MULTIPLY_TOKENS = tokens
  .filter((token) => !(token.tags as CoinTag[]).includes('lp-token'))
  .map((token) => token.symbol)
