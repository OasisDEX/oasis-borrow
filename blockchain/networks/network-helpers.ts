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

export const isTestnet = (connectedChain: NetworkConfigHexId | undefined) => {
  if (!connectedChain) {
    return false
  }
  return networks
    .filter((network) => network.testnet)
    .map((network) => network.hexId)
    .includes(connectedChain)
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

const networksWithForksAtTheBeginning: NetworkConfig[] = [...forkNetworks, ...networks]

const networksSet = networksWithForksAtTheBeginning.reduce((acc, network) => {
  if (acc.some((n) => n.hexId === network.hexId)) {
    console.log('NetworkConfig with hexId ', network.hexId, ' already exists, skipping.')
    return acc
  }
  return [...acc, network]
}, [] as NetworkConfig[])

export const enableNetworksSet = networksSet.filter((network) => network.enabled)
export const networkSetByHexId = keyBy(enableNetworksSet, 'hexId')
export const networkSetById = keyBy(enableNetworksSet, 'id')

export const getOppositeNetworkHexIdByHexId = (currentConnectedChainHexId: NetworkConfigHexId) => {
  const networkConfig = networkSetByHexId[currentConnectedChainHexId]
  if (!networkConfig)
    console.log('NetworkConfig not found for hexid ', currentConnectedChainHexId, ' using mainnet.')
  return (
    (networkConfig &&
      (networkConfig.testnet ? networkConfig.mainnetHexId : networkConfig.testnetHexId)) ||
    networksById['1'].hexId
  )
}

export const shouldSetRequestedNetworkHexId = (
  current?: NetworkConfigHexId,
  requested?: NetworkConfigHexId,
): boolean => {
  if (current !== undefined && requested === undefined) {
    return false
  }
  if (current === undefined && requested !== undefined) {
    return true
  }

  if (current === undefined && requested === undefined) {
    return false
  }

  const currentNetwork = networkSetByHexId[current!]
  const requestedNetwork = networkSetByHexId[requested!]

  if (requestedNetwork.isCustomFork) {
    return true
  }

  if (requestedNetwork.testnet) {
    return true
  }

  return currentNetwork.mainnetHexId !== requestedNetwork.mainnetHexId
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
  (connectedChain: NetworkConfigHexId | undefined) => (network: NetworkConfig) => {
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
