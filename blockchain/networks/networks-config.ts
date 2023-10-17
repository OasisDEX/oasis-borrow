'use client'
import { JsonRpcBatchProvider } from 'blockchain/jsonRpcBatchProvider'
import {
  arbitrumGoerliRpc,
  arbitrumMainnetRpc,
  baseGoerliRpc,
  baseMainnetRpc,
  goerliRpc,
  mainnetRpc,
  optimismGoerliRpc,
  optimismMainnetRpc,
  polygonMainnetRpc,
  polygonMumbaiRpc,
} from 'config/rpcConfig'
import { mainnetCacheUrl } from 'config/runtimeConfig'
import type { ethers } from 'ethers'
import type { ContractDesc } from 'features/web3Context'
import { GraphQLClient } from 'graphql-request'
import { getLocalAppConfig } from 'helpers/config'
import type { Abi } from 'helpers/types/Abi.types'
import { keyBy, memoize } from 'lodash'
import { env } from 'process'
import arbitrumMainnetBadge from 'public/static/img/network_icons/arbitrum_badge_mainnet.svg'
import arbitrumMainnetIcon from 'public/static/img/network_icons/arbitrum_mainnet.svg'
import baseMainnetBadge from 'public/static/img/network_icons/base_badge_mainnet.svg'
import baseMainnetIcon from 'public/static/img/network_icons/base_mainnet.svg'
import ethereumMainnetBadge from 'public/static/img/network_icons/ethereum_badge_mainnet.svg'
import ethereumMainnetIcon from 'public/static/img/network_icons/ethereum_mainnet.svg'
import optimismMainnetBadge from 'public/static/img/network_icons/optimism_badge_mainnet.svg'
import optimismMainnetIcon from 'public/static/img/network_icons/optimism_mainnet.svg'
import polygonMainnetBadge from 'public/static/img/network_icons/polygon_badge_mainnet.svg'
import polygonMainnetIcon from 'public/static/img/network_icons/polygon_mainnet.svg'

import { NetworkHexIds } from './network-hex-ids'
import { NetworkIds } from './network-ids'
import type { NetworkLabelType } from './network-names'
import { NetworkNames } from './network-names'

export type NetworkConfigHexId = `0x${number | string}`

const ethereumMainnetGradient = 'linear-gradient(128deg, #6580EB 23.94%, #8EA2F2 110.63%)'
const optimismMainnetGradient = 'linear-gradient(135deg, #FF0420 0%, #FF6C7D 100%)'
const arbitrumMainnetGradient = 'linear-gradient(128deg, #243145 3.74%, #4DA7F8 83.51%)'
const baseMainnetGradient = 'linear-gradient(128deg, #0052ff 3.74%, #6696ff 83.51%)'

export const ethereumMainnetHexId: NetworkConfigHexId = NetworkHexIds.MAINNET
export const optimismMainnetHexId: NetworkConfigHexId = NetworkHexIds.OPTIMISMMAINNET
export const arbitrumMainnetHexId: NetworkConfigHexId = NetworkHexIds.ARBITRUMMAINNET
export const baseMainnetHexId: NetworkConfigHexId = NetworkHexIds.BASEMAINNET

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
  gradient: string
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
  gradient: ethereumMainnetGradient,
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
  gradient: ethereumMainnetGradient,
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
  gradient: arbitrumMainnetGradient,
  testnet: false,
  isEnabled: () => true,
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
  gradient: arbitrumMainnetGradient,
  testnet: true,
  isEnabled: () => true,
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
  gradient: '',
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
  gradient: '',
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
  gradient: optimismMainnetGradient,
  testnet: false,
  isEnabled: () => true,
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
  gradient: optimismMainnetGradient,
  testnet: true,
  isEnabled: () => true,
  token: 'ETH',
  rpcUrl: optimismGoerliRpc,
  getReadProvider: () => undefined,
  getParentNetwork: () => undefined,
  getCacheApi: () => undefined,
  isCustomFork: false,
}

const baseMainnetConfig: NetworkConfig = {
  id: NetworkIds.BASEMAINNET,
  hexId: NetworkHexIds.BASEMAINNET,
  mainnetHexId: NetworkHexIds.BASEMAINNET,
  testnetHexId: NetworkHexIds.BASEGOERLI,
  mainnetId: NetworkIds.BASEMAINNET,
  testnetId: NetworkIds.BASEGOERLI,
  name: NetworkNames.baseMainnet,
  label: 'Base',
  color: '#0052ff',
  icon: baseMainnetIcon as string,
  badge: baseMainnetBadge as string,
  gradient: baseMainnetGradient,
  testnet: false,
  isEnabled: () => getLocalAppConfig('features').BaseNetworkEnabled,
  token: 'ETH',
  rpcUrl: baseMainnetRpc,
  getReadProvider: memoize(
    () =>
      new JsonRpcBatchProvider(baseMainnetRpc, {
        chainId: NetworkIds.BASEMAINNET,
        name: NetworkNames.baseMainnet,
      }),
  ),
  getCacheApi: () => undefined,
  getParentNetwork: () => undefined,
  isCustomFork: false,
  links: [
    { label: 'Bridge', openBridgeWidget: true },
    { label: 'Basescan', url: 'https://basescan.org/' },
    { label: 'Official Site', url: 'https://base.org/' },
  ],
}

const baseGoerliConfig: NetworkConfig = {
  id: NetworkIds.BASEGOERLI,
  hexId: NetworkHexIds.BASEGOERLI,
  mainnetHexId: NetworkHexIds.BASEMAINNET,
  testnetHexId: NetworkHexIds.BASEGOERLI,
  mainnetId: NetworkIds.BASEMAINNET,
  testnetId: NetworkIds.BASEGOERLI,
  name: NetworkNames.baseGoerli,
  label: 'Base Goerli',
  color: '#0052ff',
  icon: baseMainnetIcon as string,
  badge: baseMainnetBadge as string,
  gradient: baseMainnetGradient,
  testnet: true,
  isEnabled: () => getLocalAppConfig('features').BaseNetworkEnabled,
  token: 'ETH',
  rpcUrl: baseGoerliRpc,
  getReadProvider: memoize(
    () =>
      new JsonRpcBatchProvider(baseGoerliRpc, {
        chainId: NetworkIds.BASEGOERLI,
        name: NetworkNames.baseGoerli,
      }),
  ),
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
  gradient: '',
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
  baseMainnetConfig,
  baseGoerliConfig,
]

export const defaultForkSettings: NetworkConfig = {
  id: NetworkIds.HARDHAT,
  hexId: NetworkHexIds.DEFAULTFORK,
  name: NetworkNames.ethereumMainnet, // these are being overridden
  label: 'Ethereum', // these are being overridden
  color: '#728aee',
  icon: ethereumMainnetIcon as string,
  badge: ethereumMainnetBadge as string,
  gradient: ethereumMainnetGradient,
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
