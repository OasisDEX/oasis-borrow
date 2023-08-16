import { JsonRpcBatchProvider } from 'blockchain/jsonRpcBatchProvider'
import {
  arbitrumGoerliRpc,
  arbitrumMainnetRpc,
  goerliRpc,
  mainnetRpc,
  optimismGoerliRpc,
  optimismMainnetRpc,
  polygonMainnetRpc,
  polygonMumbaiRpc,
} from 'config/rpcConfig'
import { mainnetCacheUrl } from 'config/runtimeConfig'
import { ethers } from 'ethers'
import { ContractDesc } from 'features/web3Context'
import { GraphQLClient } from 'graphql-request'
import { Abi } from 'helpers/types'
import { getFeatureToggle } from 'helpers/useFeatureToggle'
import { keyBy, memoize } from 'lodash'
import { env } from 'process'
import arbitrumMainnetBadge from 'public/static/img/network_icons/arbitrum_badge_mainnet.svg'
import arbitrumMainnetIcon from 'public/static/img/network_icons/arbitrum_mainnet.svg'
import ethereumMainnetBadge from 'public/static/img/network_icons/ethereum_badge_mainnet.svg'
import ethereumMainnetIcon from 'public/static/img/network_icons/ethereum_mainnet.svg'
import optimismMainnetBadge from 'public/static/img/network_icons/optimism_badge_mainnet.svg'
import optimismMainnetIcon from 'public/static/img/network_icons/optimism_mainnet.svg'
import polygonMainnetBadge from 'public/static/img/network_icons/polygon_badge_mainnet.svg'
import polygonMainnetIcon from 'public/static/img/network_icons/polygon_mainnet.svg'

import { NetworkHexIds } from './network-hex-ids'
import { NetworkIds } from './network-ids'
import { NetworkLabelType, NetworkNames } from './network-names'

export type NetworkConfigHexId = `0x${number | string}`

export const ethereumMainnetHexId: NetworkConfigHexId = NetworkHexIds.MAINNET
export const optimismMainnetHexId: NetworkConfigHexId = NetworkHexIds.OPTIMISMMAINNET
export const arbitrumMainnetHexId: NetworkConfigHexId = NetworkHexIds.ARBITRUMMAINNET

export type NetworkConfig = {
  id: NetworkIds
  hexId: NetworkConfigHexId
  testnetHexId?: NetworkConfigHexId
  mainnetHexId?: NetworkConfigHexId
  testnetId?: NetworkIds
  mainnetId?: NetworkIds
  name: NetworkNames
  label: NetworkLabelType
  color: `#${number | string}`
  icon: string
  badge: string
  testnet: boolean
  isEnabled: () => boolean
  token: string
  rpcUrl: string
  getReadProvider: () => ethers.providers.Provider | undefined
  getParentNetwork: () => NetworkConfig | undefined
  getCacheApi: () => GraphQLClient | undefined
  isCustomFork?: boolean
  links?: { label: string; url?: string; openBridgeWidget?: boolean }[]
}

export function contractDesc(
  abi: Abi[],
  address: string,
  genesisBlock = 0,
): ContractDesc & { genesisBlock: number } {
  return { abi, address, genesisBlock }
}

export function emptyContractDesc(contractName: string): ContractDesc & { genesisBlock: number } {
  // not every contract is available on every network
  // hence this function is used to return an empty contract
  env.NODE_ENV === 'development' && console.warn('Contract not set:', contractName)
  return { abi: {}, address: '', genesisBlock: 0 }
}

const mainnetConfig: NetworkConfig = {
  id: NetworkIds.MAINNET,
  hexId: NetworkHexIds.MAINNET,
  mainnetHexId: NetworkHexIds.MAINNET,
  testnetHexId: NetworkHexIds.GOERLI,
  testnetId: NetworkIds.GOERLI,
  mainnetId: NetworkIds.MAINNET,
  token: 'ETH',
  name: NetworkNames.ethereumMainnet,
  label: 'Ethereum',
  color: '#728aee',
  icon: ethereumMainnetIcon as string,
  badge: ethereumMainnetBadge as string,
  testnet: false,
  isEnabled: () => true,
  rpcUrl: mainnetRpc,
  getReadProvider: memoize(
    () =>
      new JsonRpcBatchProvider(mainnetRpc, {
        chainId: NetworkIds.MAINNET,
        name: NetworkNames.ethereumMainnet,
      }),
  ),
  getCacheApi: memoize(() => new GraphQLClient(mainnetCacheUrl)),
  isCustomFork: false,
  getParentNetwork: () => undefined,
  links: [{ label: 'Etherscan', url: 'https://etherscan.io/' }],
}

const goerliConfig: NetworkConfig = {
  id: NetworkIds.GOERLI,
  hexId: NetworkHexIds.GOERLI,
  mainnetHexId: NetworkHexIds.MAINNET,
  testnetHexId: NetworkHexIds.GOERLI,
  mainnetId: NetworkIds.MAINNET,
  testnetId: NetworkIds.GOERLI,
  token: 'GoerliETH',
  name: NetworkNames.ethereumGoerli,
  label: 'Ethereum Goerli',
  color: '#728aee',
  icon: ethereumMainnetIcon as string,
  badge: ethereumMainnetBadge as string,
  testnet: true,
  isEnabled: () => true,
  rpcUrl: goerliRpc,
  getReadProvider: memoize(
    () =>
      new JsonRpcBatchProvider(goerliRpc, {
        chainId: NetworkIds.GOERLI,
        name: NetworkNames.ethereumGoerli,
      }),
  ),
  getCacheApi: memoize(
    () => new GraphQLClient('https://cache-goerli-staging.staging.summer.fi/api/v1'),
  ),
  isCustomFork: false,
  getParentNetwork: () => undefined,
}

const arbitrumMainnetConfig: NetworkConfig = {
  id: NetworkIds.ARBITRUMMAINNET,
  hexId: NetworkHexIds.ARBITRUMMAINNET,
  mainnetHexId: NetworkHexIds.ARBITRUMMAINNET,
  testnetHexId: NetworkHexIds.ARBITRUMGOERLI,
  mainnetId: NetworkIds.ARBITRUMMAINNET,
  testnetId: NetworkIds.ARBITRUMGOERLI,
  name: NetworkNames.arbitrumMainnet,
  label: 'Arbitrum',
  color: '#28a0f0',
  icon: arbitrumMainnetIcon as string,
  badge: arbitrumMainnetBadge as string,
  testnet: false,
  isEnabled: () => getFeatureToggle('UseNetworkSwitcherArbitrum'),
  token: 'ETH',
  rpcUrl: arbitrumMainnetRpc,
  getReadProvider: memoize(
    () =>
      new JsonRpcBatchProvider(arbitrumMainnetRpc, {
        chainId: NetworkIds.ARBITRUMMAINNET,
        name: NetworkNames.arbitrumMainnet,
      }),
  ),
  getCacheApi: () => undefined,
  getParentNetwork: () => undefined,
  isCustomFork: false,
  links: [
    { label: 'Bridge', openBridgeWidget: true },
    { label: 'Arbiscan', url: 'https://arbiscan.io/' },
    { label: 'Official Site', url: 'https://arbitrum.foundation/' },
  ],
}

const arbitrumGoerliConfig: NetworkConfig = {
  id: NetworkIds.ARBITRUMGOERLI,
  hexId: NetworkHexIds.ARBITRUMGOERLI,
  mainnetHexId: NetworkHexIds.ARBITRUMMAINNET,
  testnetHexId: NetworkHexIds.ARBITRUMGOERLI,
  mainnetId: NetworkIds.ARBITRUMMAINNET,
  testnetId: NetworkIds.ARBITRUMGOERLI,
  name: NetworkNames.arbitrumGoerli,
  label: 'Arbitrum Goerli',
  color: '#28a0f0',
  icon: arbitrumMainnetIcon as string,
  badge: arbitrumMainnetBadge as string,
  testnet: true,
  isEnabled: () => getFeatureToggle('UseNetworkSwitcherArbitrum'),
  token: 'AGOR',
  rpcUrl: arbitrumGoerliRpc,
  getReadProvider: memoize(
    () =>
      new JsonRpcBatchProvider(arbitrumGoerliRpc, {
        chainId: NetworkIds.ARBITRUMGOERLI,
        name: NetworkNames.arbitrumGoerli,
      }),
  ),
  getParentNetwork: () => undefined,
  getCacheApi: () => undefined,
  isCustomFork: false,
}

const polygonMainnetConfig: NetworkConfig = {
  id: NetworkIds.POLYGONMAINNET,
  hexId: NetworkHexIds.POLYGONMAINNET,
  testnetHexId: NetworkHexIds.POLYGONMUMBAI,
  mainnetHexId: NetworkHexIds.POLYGONMAINNET,
  mainnetId: NetworkIds.POLYGONMAINNET,
  testnetId: NetworkIds.POLYGONMUMBAI,
  name: NetworkNames.polygonMainnet,
  label: 'Polygon',
  color: '#9866ed',
  icon: polygonMainnetIcon as string,
  badge: polygonMainnetBadge as string,
  testnet: false,
  isEnabled: () => false,
  token: 'ETH',
  rpcUrl: polygonMainnetRpc,
  getReadProvider: () => undefined,
  getCacheApi: () => undefined,
  getParentNetwork: () => undefined,
  isCustomFork: false,
}

const polygonMumbaiConfig: NetworkConfig = {
  id: NetworkIds.POLYGONMUMBAI,
  hexId: NetworkHexIds.POLYGONMUMBAI,
  mainnetHexId: NetworkHexIds.POLYGONMAINNET,
  testnetHexId: NetworkHexIds.POLYGONMUMBAI,
  mainnetId: NetworkIds.POLYGONMAINNET,
  testnetId: NetworkIds.POLYGONMUMBAI,
  name: NetworkNames.polygonMumbai,
  label: 'Polygon Mumbai',
  color: '#9866ed',
  icon: polygonMainnetIcon as string,
  badge: polygonMainnetBadge as string,
  testnet: true,
  isEnabled: () => false,
  token: 'ETH',
  rpcUrl: polygonMumbaiRpc,
  getReadProvider: () => undefined,
  getParentNetwork: () => undefined,
  getCacheApi: () => undefined,
  isCustomFork: false,
}

const optimismMainnetConfig: NetworkConfig = {
  id: NetworkIds.OPTIMISMMAINNET,
  hexId: NetworkHexIds.OPTIMISMMAINNET,
  testnetHexId: NetworkHexIds.OPTIMISMGOERLI,
  mainnetHexId: NetworkHexIds.OPTIMISMMAINNET,
  mainnetId: NetworkIds.OPTIMISMMAINNET,
  testnetId: NetworkIds.OPTIMISMGOERLI,
  name: NetworkNames.optimismMainnet,
  label: 'Optimism',
  color: '#ff3f49',
  icon: optimismMainnetIcon as string,
  badge: optimismMainnetBadge as string,
  testnet: false,
  isEnabled: () => getFeatureToggle('UseNetworkSwitcherOptimism'),
  token: 'ETH',
  rpcUrl: optimismMainnetRpc,
  getReadProvider: memoize(
    () =>
      new JsonRpcBatchProvider(optimismMainnetRpc, {
        chainId: NetworkIds.OPTIMISMMAINNET,
        name: NetworkNames.optimismMainnet,
      }),
  ),
  getCacheApi: () => undefined,
  getParentNetwork: () => undefined,
  isCustomFork: false,
  links: [
    { label: 'Bridge', openBridgeWidget: true },
    { label: 'Optimistic Etherscan', url: 'https://optimistic.etherscan.io/' },
    { label: 'Official Site', url: 'https://www.optimism.io/' },
  ],
}

const optimismGoerliConfig: NetworkConfig = {
  id: NetworkIds.OPTIMISMGOERLI,
  hexId: NetworkHexIds.OPTIMISMGOERLI,
  mainnetHexId: NetworkHexIds.OPTIMISMMAINNET,
  testnetHexId: NetworkHexIds.OPTIMISMGOERLI,
  mainnetId: NetworkIds.OPTIMISMMAINNET,
  testnetId: NetworkIds.OPTIMISMGOERLI,
  name: NetworkNames.optimismGoerli,
  label: 'Optimism Goerli',
  color: '#ff3f49',
  icon: optimismMainnetIcon as string,
  badge: optimismMainnetBadge as string,
  testnet: true,
  isEnabled: () => getFeatureToggle('UseNetworkSwitcherOptimism'),
  token: 'ETH',
  rpcUrl: optimismGoerliRpc,
  getReadProvider: () => undefined,
  getParentNetwork: () => undefined,
  getCacheApi: () => undefined,
  isCustomFork: false,
}

export const ethNullAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const emptyNetworkConfig: NetworkConfig = {
  hexId: NetworkHexIds.EMPTYNET,
  name: 'empty' as NetworkNames,
  label: 'empty' as NetworkLabelType,
  color: '#ff',
  icon: 'empty',
  badge: 'empty',
  testnet: false,
  isEnabled: () => true,
  id: NetworkIds.EMPTYNET,
  token: 'ETH',
  rpcUrl: 'empty',
  getReadProvider: () => undefined,
  getCacheApi: () => undefined,
  getParentNetwork: () => undefined,
  isCustomFork: false,
}

export const mainnetNetworks = [mainnetConfig, goerliConfig]

export const L2Networks = [
  arbitrumMainnetConfig,
  arbitrumGoerliConfig,
  polygonMainnetConfig,
  polygonMumbaiConfig,
  optimismMainnetConfig,
  optimismGoerliConfig,
]

export const defaultForkSettings: NetworkConfig = {
  id: NetworkIds.HARDHAT,
  hexId: NetworkHexIds.DEFAULTFORK,
  name: NetworkNames.ethereumMainnet, // these are being overridden
  label: 'Ethereum', // these are being overridden
  color: '#728aee',
  icon: ethereumMainnetIcon as string,
  badge: ethereumMainnetBadge as string,
  testnet: true,
  isEnabled: () => false,
  token: 'ETH',
  rpcUrl: '',
  getReadProvider: () => undefined,
  getParentNetwork: () => undefined,
  getCacheApi: () => undefined,
  isCustomFork: true,
}

export const networks = [...mainnetNetworks, ...L2Networks]

export const networksById = keyBy(networks, 'id')
export const networksByName = keyBy(networks, 'name')
export const networksByHexId = keyBy(networks, 'hexId')
export const dappName = 'Summer.fi'
export const pollingInterval = 12000
