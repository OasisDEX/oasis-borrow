import { MainNetworkNames } from 'blockchain/networks'
import { TokenConfig } from 'blockchain/tokensMetadata'
import { LendingProtocol } from 'lendingProtocols'

export const ajnaTokensMetadata: TokenConfig[] = [
  {
    symbol: 'TBTC',
    precision: 18,
    digits: 5,
    digitsInstant: 3,
    name: 'Threshold Bitcoin',
    icon: 'tbtc_circle_color',
    iconCircle: 'tbtc_circle_color',
    color: '#000000',
    background: '#000000',
    bannerIcon: '',
    bannerGif: '',
    coinbaseTicker: 'tbtc',
    coinGeckoTicker: 'tbtc',
    coinpaprikaTicker: 'tbtc-tbtc-v2',
    rootToken: 'BTC',
    tags: [],
    protocol: LendingProtocol.Ajna,
    chain: MainNetworkNames.ethereumMainnet,
  },
]
