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
import { ContractDesc } from 'features/web3Context'
import { NetworkLabelType, NetworkNames } from 'helpers/networkNames'
import { Abi } from 'helpers/types'
import { keyBy } from 'lodash'
import arbitrumMainnetIcon from 'public/static/img/network_icons/arbitrum_mainnet.svg'
import ethereumMainnetIcon from 'public/static/img/network_icons/ethereum_mainnet.svg'
import optimismMainnetIcon from 'public/static/img/network_icons/optimism_mainnet.svg'
import polygonMainnetIcon from 'public/static/img/network_icons/polygon_mainnet.svg'

import { NetworkIds } from './networkIds'

export type NetworkConfigHexId = `0x${number | string}`

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
  testnet: boolean
  enabled: boolean
  token: string
  rpcCallsEndpoint: string
}

export function contractDesc(
  abi: Abi[],
  address: string,
  genesisBlock = 0,
): ContractDesc & { genesisBlock: number } {
  return { abi, address, genesisBlock }
}

const mainnetConfig: NetworkConfig = {
  id: NetworkIds.MAINNET,
  hexId: '0x1',
  testnetHexId: '0x5',
  testnetId: NetworkIds.GOERLI,
  token: 'ETH',
  name: NetworkNames.ethereumMainnet,
  label: 'Ethereum',
  color: '#728aee',
  icon: ethereumMainnetIcon as string,
  testnet: false,
  enabled: true,
  rpcCallsEndpoint: mainnetRpc,
}

const goerliConfig: NetworkConfig = {
  id: NetworkIds.GOERLI,
  hexId: '0x5',
  mainnetHexId: '0x1',
  mainnetId: NetworkIds.MAINNET,
  token: 'GoerliETH',
  name: NetworkNames.ethereumGoerli,
  label: 'Ethereum Goerli',
  color: '#728aee',
  icon: ethereumMainnetIcon as string,
  testnet: true,
  enabled: true,
  rpcCallsEndpoint: goerliRpc,
}

const hardhatConfig: NetworkConfig = {
  id: NetworkIds.HARDHAT,
  hexId: '0x859',
  name: NetworkNames.ethereumHardhat,
  label: 'Ethereum Hardhat',
  color: '#728aee',
  icon: ethereumMainnetIcon as string,
  testnet: true,
  enabled: false,
  token: 'ETH',
  rpcCallsEndpoint: `http://localhost:8545`,
}

const arbitrumMainnetConfig: NetworkConfig = {
  id: NetworkIds.ARBITRUMMAINNET,
  hexId: '0xa4b1',
  testnetHexId: '0x66eed',
  testnetId: NetworkIds.ARBITRUMGOERLI,
  name: NetworkNames.arbitrumMainnet,
  label: 'Arbitrum',
  color: '#28a0f0',
  icon: arbitrumMainnetIcon as string,
  testnet: false,
  enabled: true,
  token: 'ETH',
  rpcCallsEndpoint: arbitrumMainnetRpc,
}

const arbitrumGoerliConfig: NetworkConfig = {
  id: NetworkIds.ARBITRUMGOERLI,
  hexId: '0x66eed',
  mainnetHexId: '0xa4b1',
  mainnetId: NetworkIds.ARBITRUMMAINNET,
  name: NetworkNames.arbitrumGoerli,
  label: 'Arbitrum Goerli',
  color: '#28a0f0',
  icon: arbitrumMainnetIcon as string,
  testnet: true,
  enabled: true,
  token: 'AGOR',
  rpcCallsEndpoint: arbitrumGoerliRpc,
}

const polygonMainnetConfig: NetworkConfig = {
  id: NetworkIds.POLYGONMAINNET,
  hexId: '0x89',
  testnetHexId: '0x13881',
  testnetId: NetworkIds.POLYGONMUMBAI,
  name: NetworkNames.polygonMainnet,
  label: 'Polygon',
  color: '#9866ed',
  icon: polygonMainnetIcon as string,
  testnet: false,
  enabled: true,
  token: 'ETH',
  rpcCallsEndpoint: polygonMainnetRpc,
}

const polygonMumbaiConfig: NetworkConfig = {
  id: NetworkIds.POLYGONMUMBAI,
  hexId: '0x13881',
  mainnetHexId: '0x89',
  mainnetId: NetworkIds.POLYGONMAINNET,
  name: NetworkNames.polygonMumbai,
  label: 'Polygon Mumbai',
  color: '#9866ed',
  icon: polygonMainnetIcon as string,
  testnet: true,
  enabled: true,
  token: 'ETH',
  rpcCallsEndpoint: polygonMumbaiRpc,
}

const optimismMainnetConfig: NetworkConfig = {
  id: NetworkIds.OPTIMISMMAINNET,
  hexId: '0xa',
  testnetHexId: '0x1a4',
  testnetId: NetworkIds.OPTIMISMGOERLI,
  name: NetworkNames.optimismMainnet,
  label: 'Optimism',
  color: '#ff3f49',
  icon: optimismMainnetIcon as string,
  testnet: false,
  enabled: true,
  token: 'ETH',
  rpcCallsEndpoint: optimismMainnetRpc,
}

const optimismGoerliConfig: NetworkConfig = {
  id: NetworkIds.OPTIMISMGOERLI,
  hexId: '0x1a4',
  mainnetHexId: '0xa',
  mainnetId: NetworkIds.OPTIMISMMAINNET,
  name: NetworkNames.optimismGoerli,
  label: 'Optimism Goerli',
  color: '#ff3f49',
  icon: optimismMainnetIcon as string,
  testnet: true,
  enabled: true,
  token: 'ETH',
  rpcCallsEndpoint: optimismGoerliRpc,
}

export const ethNullAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const emptyNetworkConfig: NetworkConfig = {
  hexId: '0x0',
  name: 'empty' as NetworkNames,
  label: 'empty' as NetworkLabelType,
  color: '#ff',
  icon: 'empty',
  testnet: false,
  enabled: true,
  id: NetworkIds.EMPTYNET,
  token: 'ETH',
  rpcCallsEndpoint: 'empty',
}

export const networks = [
  mainnetConfig,
  hardhatConfig,
  goerliConfig,
  arbitrumMainnetConfig,
  arbitrumGoerliConfig,
  polygonMainnetConfig,
  polygonMumbaiConfig,
  optimismMainnetConfig,
  optimismGoerliConfig,
]
export const networksById = keyBy(networks, 'id')
export const networksByName = keyBy(networks, 'name')
export const networksByHexId = keyBy(networks, 'hexId')
export const dappName = 'Oasis'
export const pollingInterval = 12000
