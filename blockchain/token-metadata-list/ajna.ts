import { MainNetworkNames } from 'blockchain/networks'
import { TokenConfig } from 'blockchain/tokensMetadata'
import { LendingProtocol } from 'lendingProtocols'

export const ajnaTokensMetadata: TokenConfig[] = [
  {
    symbol: 'GHO',
    precision: 18,
    digits: 5,
    digitsInstant: 3,
    name: 'GHO',
    icon: 'gho_circle_color',
    iconCircle: 'gho_circle_color',
    color: '#C9B9EE',
    background: '#1F1F30',
    bannerIcon: '',
    bannerGif: '',
    coinbaseTicker: 'gho',
    coinGeckoTicker: 'gho',
    coinpaprikaTicker: 'gho-gho',
    tags: [],
    protocol: LendingProtocol.Ajna,
    chain: MainNetworkNames.ethereumMainnet,
  },
  {
    symbol: 'WLD',
    precision: 18,
    digits: 5,
    digitsInstant: 3,
    name: 'Worldcoin',
    icon: 'wld_circle_color',
    iconCircle: 'wld_circle_color',
    color: '#1E1E1C',
    background: '#1E1E1C',
    bannerIcon: '',
    bannerGif: '',
    coinbaseTicker: 'worldcoin-org',
    coinGeckoTicker: 'worldcoin-wld',
    coinpaprikaTicker: 'wld-worldcoi',
    tags: [],
    protocol: LendingProtocol.Ajna,
    chain: MainNetworkNames.ethereumMainnet,
  },
]
