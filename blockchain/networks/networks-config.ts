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

import { NetworkIds } from './network-ids'
import { NetworkLabelType, NetworkNames } from './network-names'
export type NetworkConfigHexId = `0x${number | string}`

export const ethereumMainnetHexId: NetworkConfigHexId = '0x1'
export const optimismMainnetHexId: NetworkConfigHexId = '0xa'
export const arbitrumMainnetHexId: NetworkConfigHexId = '0xa4b1'

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
  enabled: boolean
  token: string
  rpcUrl: string
  getReadProvider: () => ethers.providers.Provider | undefined
  getParentNetwork: () => NetworkConfig | undefined
  getCacheApi: () => GraphQLClient | undefined
  isCustomFork?: boolean
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
  hexId: '0x1',
  mainnetHexId: '0x1',
  testnetHexId: '0x5',
  testnetId: NetworkIds.GOERLI,
  mainnetId: NetworkIds.MAINNET,
  token: 'ETH',
  name: NetworkNames.ethereumMainnet,
  label: 'Ethereum',
  color: '#728aee',
  icon: ethereumMainnetIcon as string,
  badge: ethereumMainnetBadge as string,
  testnet: false,
  enabled: true,
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
}

const goerliConfig: NetworkConfig = {
  id: NetworkIds.GOERLI,
  hexId: '0x5',
  mainnetHexId: '0x1',
  testnetHexId: '0x5',
  mainnetId: NetworkIds.MAINNET,
  testnetId: NetworkIds.GOERLI,
  token: 'GoerliETH',
  name: NetworkNames.ethereumGoerli,
  label: 'Ethereum Goerli',
  color: '#728aee',
  icon: ethereumMainnetIcon as string,
  badge: ethereumMainnetBadge as string,
  testnet: true,
  enabled: true,
  rpcUrl: goerliRpc,
  getReadProvider: memoize(
    () =>
      new JsonRpcBatchProvider(goerliRpc, {
        chainId: NetworkIds.GOERLI,
        name: NetworkNames.ethereumGoerli,
      }),
  ),
  getCacheApi: memoize(
    () => new GraphQLClient('https://oazo-bcache-goerli-staging.new.summer.fi/api/v1'),
  ),
  isCustomFork: false,
  getParentNetwork: () => undefined,
}

const arbitrumMainnetConfig: NetworkConfig = {
  id: NetworkIds.ARBITRUMMAINNET,
  hexId: '0xa4b1',
  mainnetHexId: '0xa4b1',
  testnetHexId: '0x66eed',
  mainnetId: NetworkIds.ARBITRUMMAINNET,
  testnetId: NetworkIds.ARBITRUMGOERLI,
  name: NetworkNames.arbitrumMainnet,
  label: 'Arbitrum',
  color: '#28a0f0',
  icon: arbitrumMainnetIcon as string,
  badge: arbitrumMainnetBadge as string,
  testnet: false,
  enabled: true,
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
}

const arbitrumGoerliConfig: NetworkConfig = {
  id: NetworkIds.ARBITRUMGOERLI,
  hexId: '0x66eed',
  mainnetHexId: '0xa4b1',
  testnetHexId: '0x66eed',
  mainnetId: NetworkIds.ARBITRUMMAINNET,
  testnetId: NetworkIds.ARBITRUMGOERLI,
  name: NetworkNames.arbitrumGoerli,
  label: 'Arbitrum Goerli',
  color: '#28a0f0',
  icon: arbitrumMainnetIcon as string,
  badge: arbitrumMainnetBadge as string,
  testnet: true,
  enabled: true,
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
  hexId: '0x89',
  testnetHexId: '0x13881',
  mainnetHexId: '0x89',
  mainnetId: NetworkIds.POLYGONMAINNET,
  testnetId: NetworkIds.POLYGONMUMBAI,
  name: NetworkNames.polygonMainnet,
  label: 'Polygon',
  color: '#9866ed',
  icon: polygonMainnetIcon as string,
  badge: polygonMainnetBadge as string,
  testnet: false,
  enabled: false,
  token: 'ETH',
  rpcUrl: polygonMainnetRpc,
  getReadProvider: () => undefined,
  getCacheApi: () => undefined,
  getParentNetwork: () => undefined,
  isCustomFork: false,
}

const polygonMumbaiConfig: NetworkConfig = {
  id: NetworkIds.POLYGONMUMBAI,
  hexId: '0x13881',
  mainnetHexId: '0x89',
  testnetHexId: '0x13881',
  mainnetId: NetworkIds.POLYGONMAINNET,
  testnetId: NetworkIds.POLYGONMUMBAI,
  name: NetworkNames.polygonMumbai,
  label: 'Polygon Mumbai',
  color: '#9866ed',
  icon: polygonMainnetIcon as string,
  badge: polygonMainnetBadge as string,
  testnet: true,
  enabled: false,
  token: 'ETH',
  rpcUrl: polygonMumbaiRpc,
  getReadProvider: () => undefined,
  getParentNetwork: () => undefined,
  getCacheApi: () => undefined,
  isCustomFork: false,
}

const optimismMainnetConfig: NetworkConfig = {
  id: NetworkIds.OPTIMISMMAINNET,
  hexId: '0xa',
  testnetHexId: '0x1A4',
  mainnetHexId: '0xa',
  mainnetId: NetworkIds.OPTIMISMMAINNET,
  testnetId: NetworkIds.OPTIMISMGOERLI,
  name: NetworkNames.optimismMainnet,
  label: 'Optimism',
  color: '#ff3f49',
  icon: optimismMainnetIcon as string,
  badge: optimismMainnetBadge as string,
  testnet: false,
  enabled: true,
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
}

const optimismGoerliConfig: NetworkConfig = {
  id: NetworkIds.OPTIMISMGOERLI,
  hexId: '0x1A4',
  mainnetHexId: '0xa',
  testnetHexId: '0x1A4',
  mainnetId: NetworkIds.OPTIMISMMAINNET,
  testnetId: NetworkIds.OPTIMISMGOERLI,
  name: NetworkNames.optimismGoerli,
  label: 'Optimism Goerli',
  color: '#ff3f49',
  icon: optimismMainnetIcon as string,
  badge: optimismMainnetBadge as string,
  testnet: true,
  enabled: true,
  token: 'ETH',
  rpcUrl: optimismGoerliRpc,
  getReadProvider: () => undefined,
  getParentNetwork: () => undefined,
  getCacheApi: () => undefined,
  isCustomFork: false,
}

export const ethNullAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const emptyNetworkConfig: NetworkConfig = {
  hexId: '0x0',
  name: 'empty' as NetworkNames,
  label: 'empty' as NetworkLabelType,
  color: '#ff',
  icon: 'empty',
  badge: 'empty',
  testnet: false,
  enabled: true,
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
  hexId: '0x859',
  name: NetworkNames.ethereumMainnet, // these are being overridden
  label: 'Ethereum', // these are being overridden
  color: '#728aee',
  icon: ethereumMainnetIcon as string,
  badge: ethereumMainnetBadge as string,
  testnet: true,
  enabled: false,
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
