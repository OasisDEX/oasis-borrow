import { TokenConfig } from 'blockchain/tokensMetadata'
import { MainNetworkNames } from 'helpers/networkNames'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { LendingProtocol } from 'lendingProtocols'

export const aaveV2TokensMetadata: TokenConfig[] = [
  {
    symbol: 'stETHethV2',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'stETH / ETH',
    icon: 'aave_steth_eth',
    iconCircle: 'aave_steth_eth',
    iconColor: 'aave_steth_eth',
    color: '#E2F7F9',
    background: 'linear-gradient(160.47deg, #E2F7F9 0.35%, #D3F3F5 99.18%), #000000',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/Aave_stETH.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/AAVE_stETH_v2.gif'),
    tags: [],
    protocol: LendingProtocol.AaveV2,
    chain: MainNetworkNames.ethereumMainnet,
  },
  {
    symbol: 'stETHusdcV2',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'stETH / USDC',
    icon: 'aave_steth_usdc',
    iconCircle: 'aave_steth_usdc',
    iconColor: 'aave_steth_usdc',
    color: '#E2F7F9',
    background: 'linear-gradient(160.47deg, #E2F7F9 0.35%, #D3F3F5 99.18%), #000000',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/Aave_stETH.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/AAVE_stETH_v2.gif'),
    tags: [],
    protocol: LendingProtocol.AaveV2,
    chain: MainNetworkNames.ethereumMainnet,
  },
  {
    symbol: 'ethusdcV2',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'ETH / USDC',
    icon: 'aave_eth_usdc',
    iconCircle: 'aave_eth_usdc',
    iconColor: 'aave_eth_usdc',
    color: '#E2F7F9',
    background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/Aave_ETH.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/AAVE_ETH_v2.gif'),
    tags: [],
    protocol: LendingProtocol.AaveV2,
    chain: MainNetworkNames.ethereumMainnet,
  },
  {
    symbol: 'wBTCusdcV2',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'WBTC / USDC',
    icon: 'aave_wbtc_usdc',
    iconCircle: 'aave_wbtc_usdc',
    iconColor: 'aave_wbtc_usdc',
    color: '#E2F7F9',
    background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/Aave_WBTC.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/AAVE_WBTC_v2.gif'),
    tags: [],
    protocol: LendingProtocol.AaveV2,
    chain: MainNetworkNames.ethereumMainnet,
  },
  {
    symbol: 'borrow-against-ETH',
    precision: 18,
    digits: 5,
    maxSell: '10000000',
    name: 'Borrow ETH',
    icon: 'aave_eth_usdc',
    iconCircle: 'aave_eth_usdc',
    iconColor: 'aave_eth_usdc',
    color: '#E2F7F9',
    background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/Aave_ETH.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/AAVE_ETH_v2.gif'),
    tags: [],
    protocol: LendingProtocol.AaveV2,
    chain: MainNetworkNames.ethereumMainnet,
  },
]
