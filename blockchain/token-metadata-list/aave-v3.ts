import { MainNetworkNames } from 'blockchain/networks'
import { TokenConfig } from 'blockchain/tokensMetadata'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { LendingProtocol } from 'lendingProtocols'

export const aaveV3TokensMetadata: TokenConfig[] = [
  {
    symbol: 'wstETHeth',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'WSTETH / USDC',
    icon: 'aave_wsteth_usdc',
    iconCircle: 'aave_wsteth_usdc',
    iconColor: 'aave_wsteth_usdc',
    color: '#E2F7F9',
    background: 'linear-gradient(160.47deg, #E2F7F9 0.35%, #D3F3F5 99.18%), #000000',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/Aave_v3_stETH.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/AAVE_stETH_v3.gif'),
    tags: [],
    protocol: LendingProtocol.AaveV3,
    chain: MainNetworkNames.ethereumMainnet,
  },
  {
    symbol: 'optimism-ethusdc',
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
    protocol: LendingProtocol.AaveV3,
    chain: MainNetworkNames.optimismMainnet,
  },
  {
    symbol: 'optimism-wstethusdc',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'WSTETH / USDC',
    icon: 'aave_wsteth_usdc',
    iconCircle: 'aave_wsteth_usdc',
    iconColor: 'aave_wsteth_usdc',
    color: '#E2F7F9',
    background: 'linear-gradient(160.47deg, #E2F7F9 0.35%, #D3F3F5 99.18%), #000000',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/Aave_v3_stETH.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/AAVE_stETH_v3.gif'),
    tags: [],
    protocol: LendingProtocol.AaveV3,
    chain: MainNetworkNames.optimismMainnet,
  },
  {
    symbol: 'optimism-wbtcusdc',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'WBTC / USDC',
    icon: 'aave_wsteth_usdc',
    iconCircle: 'aave_wsteth_usdc',
    iconColor: 'aave_wsteth_usdc',
    color: '#E2F7F9',
    background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/Aave_WBTC.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/AAVE_WBTC_v2.gif'),
    tags: [],
    protocol: LendingProtocol.AaveV3,
    chain: MainNetworkNames.optimismMainnet,
  },
  {
    symbol: 'arbitrum-ethusdc',
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
    protocol: LendingProtocol.AaveV3,
    chain: MainNetworkNames.arbitrumMainnet,
  },
  {
    symbol: 'arbitrum-wstethusdc',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'WSTETH / USDC',
    icon: 'aave_wsteth_usdc',
    iconCircle: 'aave_wsteth_usdc',
    iconColor: 'aave_wsteth_usdc',
    color: '#E2F7F9',
    background: 'linear-gradient(160.47deg, #E2F7F9 0.35%, #D3F3F5 99.18%), #000000',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/Aave_v3_stETH.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/AAVE_stETH_v3.gif'),
    tags: [],
    protocol: LendingProtocol.AaveV3,
    chain: MainNetworkNames.arbitrumMainnet,
  },
  {
    symbol: 'arbitrum-wbtcusdc',
    precision: 18,
    digits: 5,
    digitsInstant: 2,
    name: 'WBTC / USDC',
    icon: 'aave_wsteth_usdc',
    iconCircle: 'aave_wsteth_usdc',
    iconColor: 'aave_wsteth_usdc',
    color: '#E2F7F9',
    background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
    bannerIcon: staticFilesRuntimeUrl('/static/img/tokens/Aave_WBTC.png'),
    bannerGif: staticFilesRuntimeUrl('/static/img/tokens/AAVE_WBTC_v2.gif'),
    tags: [],
    protocol: LendingProtocol.AaveV3,
    chain: MainNetworkNames.arbitrumMainnet,
  },
]
