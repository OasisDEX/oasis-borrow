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

export type NetworkConfig = {
  id: `${number}`
  hexId: `0x${number | string}`
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
  id: '1',
  hexId: '0x1',
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
  id: '5',
  hexId: '0x5',
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
  id: '2137',
  hexId: '0x859',
  name: NetworkNames.ethereumHardhat,
  label: 'Ethereum Hardhat',
  color: '#728aee',
  icon: ethereumMainnetIcon as string,
  testnet: true,
  enabled: true,
  token: 'ETH',
  rpcCallsEndpoint: `http://localhost:8545`,
}

const arbitrumMainnetConfig: NetworkConfig = {
  id: '42161',
  hexId: '0xa4b1',
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
  id: '421613',
  hexId: '0x66eed',
  name: NetworkNames.arbitrumGoerli,
  label: 'Arbitrum Goerli',
  color: '#28a0f0',
  icon: arbitrumMainnetIcon as string,
  testnet: false,
  enabled: true,
  token: 'AGOR',
  rpcCallsEndpoint: arbitrumGoerliRpc,
}

const polygonMainnetConfig: NetworkConfig = {
  id: '137',
  hexId: '0x89',
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
  id: '80001',
  hexId: '0x13881',
  name: NetworkNames.polygonMumbai,
  label: 'Polygon Mumbai',
  color: '#9866ed',
  icon: polygonMainnetIcon as string,
  testnet: false,
  enabled: true,
  token: 'ETH',
  rpcCallsEndpoint: polygonMumbaiRpc,
}

const optimismMainnetConfig: NetworkConfig = {
  id: '10',
  hexId: '0xa',
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
  id: '420',
  hexId: '0x1a4',
  name: NetworkNames.optimismMainnet,
  label: 'Optimism Goerli',
  color: '#ff3f49',
  icon: optimismMainnetIcon as string,
  testnet: false,
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
  id: '0',
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
