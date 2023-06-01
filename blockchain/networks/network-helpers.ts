import { ConnectedChain } from '@web3-onboard/core'
import { getStorageValue } from 'helpers/useLocalStorage'
import { keyBy } from 'lodash'
import { env } from 'process'

import { forkNetworks, forkSettings } from './forks-config'
import { NetworkIds } from './network-ids'
import { NetworkConfig, NetworkConfigHexId, networks, networksById } from './networks-config'
import { CustomNetworkStorageKey, mainnetNetworkParameter } from './use-custom-network-parameter'

export const isTestnetEnabled = () => {
  const isDev = env.NODE_ENV !== 'production'
  const showTestnetsParam =
    window && new URLSearchParams(window.location.search).get('testnets') !== null
  return isDev || showTestnetsParam
}

export const isTestnet = (connectedChain: ConnectedChain | null) => {
  if (!connectedChain) {
    return false
  }
  return networks
    .filter((network) => network.testnet)
    .map((network) => network.hexId)
    .includes(connectedChain.id as NetworkConfigHexId)
}

export const isTestnetNetworkId = (walletChainId: NetworkIds) => {
  return networks
    .filter((network) => network.testnet)
    .map((network) => network.id)
    .includes(walletChainId)
}

export const isTestnetNetworkHexId = (networkHexId: NetworkConfigHexId) => {
  return networks
    .filter((network) => network.testnet)
    .map((network) => network.hexId)
    .includes(networkHexId)
}

export const isForkSetForNetworkId = (networkId: NetworkIds) => {
  const networkName = networksById[networkId]?.name
  return forkSettings[networkName] !== undefined
}

const networksWithForksAtTheBeginning: NetworkConfig[] = [
  ...(forkNetworks as NetworkConfig[]),
  ...networks,
]
export const networksSet = networksWithForksAtTheBeginning.reduce((acc, network) => {
  if (acc.some((n) => n.hexId === network.hexId)) {
    console.log('NetworkConfig with hexId ', network.hexId, ' already exists, skipping.')
    return acc
  }
  return [...acc, network]
}, [] as NetworkConfig[])

export const enableNetworksSet = networksSet.filter((network) => network.enabled)
export const networksListWithForksByHexId = keyBy(enableNetworksSet, 'hexId')
export const networksListWithForksById = keyBy(enableNetworksSet, 'id')

export const getOppositeNetworkHexIdByHexId = (
  currentConnectedChainHexId: ConnectedChain['id'],
) => {
  const networkConfig = networksListWithForksByHexId[currentConnectedChainHexId]
  if (!networkConfig)
    console.log('NetworkConfig not found for hexid ', currentConnectedChainHexId, ' using mainnet.')
  return (
    (networkConfig && (networkConfig.testnetHexId || networkConfig.mainnetHexId)) ||
    networksById['1'].hexId
  )
}

export const getOppositeNetworkIdById = (networkId: NetworkIds) => {
  return networksById[networkId].testnetId! || networksById[networkId].mainnetId!
}

export const getContractNetworkByWalletNetwork = (
  contractChainId: NetworkIds,
  walletChainId: NetworkIds,
) => {
  // sounds silly, but this just passes the parameter for regular network
  // unless youre on testnet, then it passes the testnet network
  if (walletChainId === contractChainId) return contractChainId
  // then if its network overriden by hardhat, we pass the hardhat network
  // doesnt matter if we're even connected
  if (!isTestnetNetworkId(walletChainId) && isForkSetForNetworkId(contractChainId)) {
    const networkName = networksById[contractChainId].name
    return Number(forkSettings[networkName]!.id) as NetworkIds
  }

  // finally, if youre on testnet, and the contract is on mainnet, it passes the testnet network
  return isTestnetNetworkId(walletChainId)
    ? getOppositeNetworkIdById(contractChainId)
    : contractChainId
}

export const filterNetworksAccordingToWalletNetwork =
  (connectedChain: ConnectedChain | null) => (network: NetworkConfig) => {
    if (!connectedChain) {
      return !network.testnet
    }

    return isTestnet(connectedChain) ? network.testnet : !network.testnet
  }

export const filterNetworksAccordingToSavedNetwork =
  (customNetworkHexId: NetworkConfigHexId) => (network: NetworkConfig) => {
    return isTestnetNetworkHexId(customNetworkHexId) ? network.testnet : !network.testnet
  }

export function getNetworkRpcEndpoint(networkId: NetworkIds, connectedChainId?: NetworkIds) {
  const customNetworkData = getStorageValue(CustomNetworkStorageKey, '')
  const { id } = (customNetworkData || mainnetNetworkParameter) as typeof mainnetNetworkParameter
  const isTestnet = isTestnetNetworkId(connectedChainId || id)
  const isForkSet = isForkSetForNetworkId(networkId)
  if (!networksById[networkId]) {
    throw new Error('Invalid contract chain id provided or not implemented yet')
  }
  if (isForkSet) {
    const networkName = networksById[networkId].name
    return forkSettings[networkName]!.url
  }
  return isTestnet
    ? networksById[networksById[networkId].testnetId!].rpcUrl
    : networksById[networkId].rpcUrl
}
