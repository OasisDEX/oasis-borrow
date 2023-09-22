import type { TokenConfig } from 'blockchain/TokenConfig'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'

export const tokenConfigs: TokenConfig[] = [
  {
    symbol: 'USDP',
    precision: 18,
    digits: 5,
    name: 'Pax Dollar',
    icon: 'usdp_circle_color',
    iconCircle: 'usdp_circle_color',
    coinpaprikaTicker: 'usdp-paxos-standard-token',
    color: '#0B9F74',
    background: 'linear-gradient(143.13deg, #0B9F74 12.24%, #64DFBB 85.9%) #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/maker_eth.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/MAKER_ETH.gif'),
    tags: [],
  },
  {
    symbol: 'STETH',
    precision: 18,
    digits: 5,
    name: 'Lido Staked ETH',
    icon: 'steth_circle_color',
    iconCircle: 'steth_circle_color',
    coinpaprikaTicker: 'steth-lido-staked-ether',
    color: '#0B91DD',
    background: 'linear-gradient(143.37deg, #00A3FF 15.97%, #0B91DD 81.1%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/maker_steth.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/Maker_stETH.gif'),
    tags: [],
  },
  {
    symbol: 'MKR',
    precision: 18,
    digits: 5,
    name: 'Maker',
    icon: 'mkr_circle_color',
    iconCircle: 'mkr_circle_color',
    coinpaprikaTicker: 'mkr-maker',
    coinbaseTicker: 'mkr-usd',
    color: '#1AAB9B',
    background: 'linear-gradient(133.41deg, #1AAB9B 17.25%, #22CAB7 86.54%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/maker_eth.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/MAKER_ETH.gif'),
    tags: [],
  },
  {
    symbol: 'WETH',
    precision: 18,
    digits: 5,
    name: 'Wrapped Ether',
    icon: 'weth_circle_color',
    iconCircle: 'weth_circle_color',
    coinpaprikaTicker: 'weth-weth',
    coinpaprikaFallbackTicker: 'eth-ethereum',
    color: '#25ddfb',
    background: 'linear-gradient(158.87deg, #E2F7F9 0%, #D3F3F5 100%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/maker_eth.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/MAKER_ETH.gif'),
    tags: [],
  },
  {
    symbol: 'ETH',
    precision: 18,
    digits: 5,
    maxSell: '10000000',
    name: 'Ether',
    icon: 'ether',
    iconCircle: 'ether_circle_color',
    coinpaprikaTicker: 'eth-ethereum',
    coinbaseTicker: 'eth-usd',
    coinGeckoId: 'ethereum',
    color: '#667FE3',
    background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/maker_eth.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/MAKER_ETH.gif'),
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
    coinpaprikaTicker: 'wbtc-wrapped-bitcoin',
    coinGeckoId: 'wrapped-bitcoin',
    color: '#f09242',
    background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/maker_wbtc.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/Maker_WBTC.gif'),
    tags: [],
    rootToken: 'BTC',
  },
  {
    symbol: 'MANA',
    precision: 18,
    digits: 5,
    name: 'Decentraland',
    icon: 'mana',
    iconCircle: 'mana_circle_color',
    color: '#f05',
    coinbaseTicker: 'mana-usd',
    coinGeckoId: 'decentraland',
    background: 'linear-gradient(160.26deg, #FFEAEA 5.25%, #FFF5EA 100%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/maker_mana.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/Maker_MANA.gif'),
    tags: [],
  },
  {
    symbol: 'LINK',
    precision: 18,
    digits: 5,
    name: 'Chainlink',
    icon: 'chainlink',
    iconCircle: 'chainlink_circle_color',
    color: '#375bd2',
    coinbaseTicker: 'link-usd',
    coinGeckoId: 'chainlink',
    background: 'linear-gradient(160.47deg, #E0E8F5 0.35%, #F0FBFD 99.18%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/maker_link.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/Maker_LINK.gif'),
    tags: [],
  },
  {
    symbol: 'GUSD',
    precision: 2,
    digits: 2,
    name: 'Gemini dollar',
    icon: 'gemini',
    iconCircle: 'gemini_circle_color',
    color: '#25ddfb',
    coinpaprikaTicker: 'gusd-gemini-dollar',
    coinGeckoId: 'gemini-dollar',
    background: 'linear-gradient(158.87deg, #E2F7F9 0%, #D3F3F5 100%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/maker_gusd.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/Maker_GUSD.gif'),
    tags: ['stablecoin'],
  },
  {
    symbol: 'YFI',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'Yearn',
    icon: 'usdc',
    iconCircle: 'yfi_circle_color',
    coinbaseTicker: 'yfi-usd',
    coinGeckoId: 'yearn-finance',
    color: '#0657f9',
    background: 'linear-gradient(160.47deg, #E0E8F5 0.35%, #F0FBFD 99.18%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/maker_yfi.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/Maker_YFI.gif'),
    tags: [],
  },
  {
    symbol: 'MATIC',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'MATIC',
    icon: 'matic_circle_color',
    iconCircle: 'matic_circle_color',
    color: '#ff077d',
    coinbaseTicker: 'matic-usd',
    coinGeckoId: 'polygon',
    background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/maker_matic.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/Maker_MATIC.gif'),
    tags: [],
  },
  {
    symbol: 'WSTETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'WSTETH',
    icon: 'wsteth_circle_color',
    iconCircle: 'wsteth_circle_color',
    coinGeckoTicker: 'wrapped-steth',
    coinGeckoId: 'wrapped-steth',
    color: '#ff077d',
    background: 'linear-gradient(158.87deg, #E2F7F9 0%, #D3F3F5 100%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/maker_steth.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/Maker_stETH.gif'),
    tags: [],
    rootToken: 'ETH',
  },
  {
    symbol: 'CBETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'Coinbase Wrapped Staked ETH',
    icon: 'cbeth_circle_color',
    iconCircle: 'cbeth_circle_color',
    //TODO: replace with values provided by design team - so far content is duplicated from ETH
    color: '#667FE3',
    background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/maker_eth.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/MAKER_ETH.gif'),
    coinbaseTicker: 'cbeth-usd',
    coinGeckoTicker: 'coinbase-wrapped-staked-eth',
    coinpaprikaTicker: 'cbeth-coinbase-wrapped-staked-eth',
    rootToken: 'ETH',
    tags: [],
  },
  {
    symbol: 'BAT',
    precision: 18,
    digits: 5,
    name: 'Basic Attention Token',
    icon: 'bat',
    iconCircle: 'bat_circle_color',
    color: '#ff4625',
    bannerIcon: '',
    background: '',
    bannerGif: '',
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
    coinpaprikaTicker: 'renbtc-renbtc',
    coinGeckoId: 'renbtc',
    color: '#838489',
    background: 'linear-gradient(160.47deg, #F1F5F5 0.35%, #E5E7E8 99.18%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/renBTC.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/renBTC.gif'),
    tags: [],
    rootToken: 'BTC',
  },
  {
    symbol: 'TUSD',
    precision: 18,
    digits: 2,
    name: 'Trust token',
    icon: 'tusd',
    iconCircle: 'tusd_circle_color',
    color: '#195aff',
    bannerIcon: '',
    background: '',
    bannerGif: '',
    tags: ['stablecoin'],
  },
  {
    symbol: 'KNC',
    precision: 18,
    digits: 5,
    name: 'Kyber Network',
    icon: 'kyber',
    iconCircle: 'kyber_circle_color',
    color: '#30cb9e',
    bannerIcon: '',
    background: '',
    bannerGif: '',
    tags: [],
  },
  {
    symbol: 'PAXUSD',
    precision: 18,
    digits: 2,
    name: 'Paxos Standard',
    icon: 'pax',
    iconCircle: 'pax_circle_color',
    color: '#005121',
    bannerIcon: '',
    background: '',
    bannerGif: '',
    tags: ['stablecoin'],
  },
  {
    symbol: 'USDT',
    precision: 6,
    digits: 2,
    name: 'Tether',
    icon: 'usdt',
    iconCircle: 'usdt_circle_color',
    color: '259c77',
    bannerIcon: '',
    background: '',
    bannerGif: '',
    tags: ['stablecoin'],
  },
  {
    symbol: 'COMP',
    precision: 18,
    digits: 5,
    name: 'Compound',
    icon: 'compound',
    iconCircle: 'compound_circle_color',
    color: '#00D395',
    bannerIcon: '',
    background: '',
    bannerGif: '',
    tags: [],
  },
  {
    symbol: 'LRC',
    precision: 18,
    digits: 5,
    name: 'Loopring',
    icon: 'lrc',
    iconCircle: 'lrc_circle_color',
    color: '#1c60ff',
    bannerIcon: '',
    background: '',
    bannerGif: '',
    tags: [],
  },
  {
    symbol: 'ZRX',
    precision: 18,
    digits: 5,
    name: '0x',
    icon: 'zerox',
    iconCircle: 'zerox_circle_color',
    color: '#000',
    bannerIcon: '',
    background: '',
    bannerGif: '',
    tags: [],
  },
  {
    symbol: 'USDC',
    precision: 6,
    digits: 2,
    digitsInstant: 2,
    maxSell: '1000000000000000',
    name: 'USD Coin',
    icon: 'usdc',
    iconCircle: 'usdc_circle_color',
    coinpaprikaTicker: 'usdc-usd-coin',
    color: '#2775ca',
    background: 'linear-gradient(152.45deg, #0666CE 8.53%, #61A9F8 91.7%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/usdc.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/usdc.gif'),
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
    color: '#000',
    bannerIcon: '',
    background: '',
    bannerGif: '',
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
    color: '#ff077d',
    coinbaseTicker: 'uni-usd',
    background: 'linear-gradient(160.65deg, #FDEEF3 2.52%, #FFE6F5 101.43%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/uni_old.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/uni_old.gif'),
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
    color: '#ff077d',
    background: 'linear-gradient(286.73deg, #B6509E 2.03%, #2EBAC6 100%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/banner_icons/aave.svg'),
    bannerGif: '',
    tags: [],
  },
  {
    symbol: 'UNIV2USDCETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2USDCETH',
    icon: 'univ2_usdc_eth_circles_color',
    iconCircle: 'univ2_usdc_eth_circles_color',
    color: '#ff077d',
    background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/uni_old_usdc_eth.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/uni_old_usdc_eth.gif'),
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2DAIUSDC',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2DAIUSDC',
    icon: 'univ2_dai_usdc_circles_color',
    iconCircle: 'univ2_dai_usdc_circles_color',
    color: '#ff077d',
    background: 'linear-gradient(160.47deg, #E0E8F5 0.35%, #F0FBFD 99.18%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/uni_old_dai_usdc.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/uni_old_dai_usdc.gif'),
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2WBTCETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2WBTCETH',
    icon: 'univ2_wbtc_eth_circles_color',
    iconCircle: 'univ2_wbtc_eth_circles_color',
    color: '#ff077d',
    background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/uni_old_wbtc_dai.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/uni_old_wbtc_eth.gif'),
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2DAIETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2DAIETH',
    icon: 'univ2_dai_eth_circles_color',
    iconCircle: 'univ2_dai_eth_circles_color',
    color: '#ff077d',
    background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/uni_old_dai_eth.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/uni_old_dai_eth.gif'),
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2ETHUSDT',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2ETHUSDT',
    icon: 'univ2_eth_usdt_circles_color',
    iconCircle: 'univ2_eth_usdt_circles_color',
    color: '#ff077d',
    bannerIcon: '',
    background: '',
    bannerGif: '',
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2UNIETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2UNIETH',
    icon: 'univ2_uni_eth_circles_color',
    iconCircle: 'univ2_uni_eth_circles_color',
    color: '#ff077d',
    background: 'linear-gradient(160.65deg, #FDEEF3 2.52%, #FFE6F5 101.43%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/uni_old_uni_eth.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/uni_old_uni_eth.gif'),
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2LINKETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2LINKETH',
    icon: 'univ2_link_eth_circles_color',
    iconCircle: 'univ2_link_eth_circles_color',
    color: '#ff077d',
    bannerIcon: '',
    background: '',
    bannerGif: '',
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2WBTCDAI',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2WBTCDAI',
    icon: 'univ2_wbtc_dai_circles_color',
    iconCircle: 'univ2_wbtc_dai_circles_color',
    color: '#ff077d',
    background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/uni_old_wbtc_dai.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/uni_old_wbtc_dai.gif'),
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2AAVEETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2AAVEETH',
    icon: 'univ2_aave_eth_circles_color',
    iconCircle: 'univ2_aave_eth_circles_color',
    color: '#ff077d',
    bannerIcon: '',
    background: '',
    bannerGif: '',
    tags: ['lp-token'],
  },
  {
    symbol: 'UNIV2DAIUSDT',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'UNIV2DAIUSDT',
    icon: 'univ2_dai_usdt_circles_color',
    iconCircle: 'univ2_dai_usdt_circles_color',
    color: '#ff077d',
    bannerIcon: '',
    background: '',
    bannerGif: '',
    tags: ['lp-token'],
  },
  {
    symbol: 'GUNIV3DAIUSDC1',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'GUNIV3 DAI / USDC 0.05%',
    icon: 'guniv3_dai_usdc1_circles_color',
    iconCircle: 'guniv3_dai_usdc1_circles_color',
    color: '#ff077d',
    background: 'linear-gradient(171.29deg, #FDDEF0 -2.46%, #FFF0F9 -2.45%, #FFF6F1 99.08%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/uni_old_dai_usdc.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/uni_old_dai_usdc.gif'),
    tags: ['lp-token'],
    token0: 'DAI',
    token1: 'USDC',
  },
  {
    symbol: 'GUNIV3DAIUSDC2',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'GUNIV3 DAI / USDC 0.01%',
    icon: 'guniv3_dai_usdc1_circles_color',
    iconCircle: 'guniv3_dai_usdc1_circles_color',
    color: '#ff077d',
    background: 'linear-gradient(171.29deg, #FDDEF0 -2.46%, #FFF0F9 -2.45%, #FFF6F1 99.08%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/uni_old_dai_usdc.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/uni_old_dai_usdc.gif'),
    tags: ['lp-token'],
    token0: 'DAI',
    token1: 'USDC',
  },
  {
    symbol: 'DAI',
    precision: 18,
    digits: 4,
    maxSell: '10000000',
    name: 'Dai',
    icon: 'dai',
    iconCircle: 'dai_circle_color',
    coinpaprikaTicker: 'dai-dai',
    coinbaseTicker: 'dai-usd',
    color: '#fdc134',
    bannerIcon: '',
    background: '',
    bannerGif: '',
    tags: ['stablecoin'],
  },
  {
    symbol: 'CRVV1ETHSTETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'stETH / ETH CRV',
    icon: 'curve_full_circle_color',
    iconCircle: 'curve_full_circle_color',
    color: '#ff077d',
    background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/crv_steth_eth.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/crv_steth_eth.gif'),
    tags: ['lp-token'],
  },
  {
    symbol: 'RETH',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'Rocket Pool ETH',
    icon: 'reth_circle_color',
    iconCircle: 'reth_circle_color',
    color: '#FFEAEA',
    coinGeckoTicker: 'rocket-pool-eth',
    background: 'linear-gradient(160.26deg, #FFEAEA 5.25%, #FFF5EA 100%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/reth-eth.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/reth-eth.gif'),
    rootToken: 'ETH',
    tags: [],
  },
  {
    symbol: 'GNO',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'Gnosis',
    icon: 'gno_circle_color',
    iconCircle: 'gno_circle_color',
    color: '#FFEAEA',
    coinGeckoTicker: 'gnosis',
    background: '',
    bannerIcon: '',
    bannerGif: '',
    tags: [],
  },
  {
    symbol: 'GHO',
    precision: 18,
    digits: 5,
    name: 'GHO',
    icon: 'gho_circle_color',
    iconCircle: 'gho_circle_color',
    color: '#C9B9EE',
    background: '',
    bannerIcon: '',
    bannerGif: '',
    coinGeckoTicker: 'gho',
    coinpaprikaTicker: 'gho-gho',
    tags: ['stablecoin'],
  },
  {
    symbol: 'SDAI',
    precision: 18,
    digits: 4,
    name: 'Savings Dai',
    icon: 'gho_circle_color',
    iconCircle: 'sdai_circle_color',
    color: '#54ac3c',
    background: '',
    bannerIcon: '',
    bannerGif: '',
    oracleTicker: 'sdai',
    rootToken: 'DAI',
    tags: [],
  },
  {
    symbol: 'TBTC',
    precision: 18,
    digits: 5,
    name: 'Threshold Bitcoin',
    icon: 'tbtc_circle_color',
    iconCircle: 'tbtc_circle_color',
    color: '#000000',
    background: '',
    bannerIcon: '',
    bannerGif: '',
    coinbaseTicker: 'btc-usd',
    coinGeckoTicker: 'bitcoin',
    coinpaprikaTicker: 'btc-bitcoin',
    rootToken: 'BTC',
    tags: [],
  },
  {
    symbol: 'WLD',
    precision: 18,
    digits: 5,
    name: 'Worldcoin',
    icon: 'wld_circle_color',
    iconCircle: 'wld_circle_color',
    color: '#1e1e1c',
    background: '',
    bannerIcon: '',
    bannerGif: '',
    coinGeckoTicker: 'worldcoin-wld',
    coinpaprikaTicker: 'wld-worldcoin',
    tags: [],
  },
  {
    symbol: 'YIELDETH',
    precision: 18,
    digits: 5,
    name: 'Real Yield ETH',
    icon: 'yieldeth_circle_color',
    iconCircle: 'yieldeth_circle_color',
    color: '#17438C',
    background: '',
    bannerIcon: '',
    bannerGif: '',
    rootToken: 'ETH',
    tags: [],
  },
  {
    symbol: 'YIELDBTC',
    precision: 18,
    digits: 5,
    name: 'Real Yield BTC',
    icon: 'yieldbtc_circle_color',
    iconCircle: 'yieldbtc_circle_color',
    color: '#17438C',
    background: '',
    bannerIcon: '',
    bannerGif: '',
    rootToken: 'BTC',
    tags: [],
  },
  {
    symbol: 'LUSD',
    precision: 18,
    digits: 5,
    name: 'Liquitity USD',
    icon: 'lusd_circle_color',
    iconCircle: 'lusd_circle_color',
    color: '#17438C',
    background: '',
    bannerIcon: '',
    bannerGif: '',
    coinpaprikaTicker: 'lusd-liquity-usd',
    tags: ['stablecoin'],
  },
  {
    symbol: 'FRAX',
    precision: 18,
    digits: 5,
    name: 'Liquitity USD',
    icon: 'frax_circle_color',
    iconCircle: 'frax_circle_color',
    color: '#17438C',
    background: '',
    bannerIcon: '',
    bannerGif: '',
    coinpaprikaTicker: 'frax-frax',
    tags: ['stablecoin'],
  },
  {
    symbol: 'SPARK',
    precision: 18,
    digits: 5,
    name: 'Spark',
    icon: 'spark_circle_color',
    iconCircle: 'spark_circle_color',
    color: '#17438C',
    background: '',
    bannerIcon: '',
    bannerGif: '',
    tags: ['stablecoin'],
  },
]
