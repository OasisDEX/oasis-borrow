import type { NetworkNames } from 'blockchain/networks/network-names'
import { keyBy } from 'lodash'
import { env } from 'process'

import { forkNetworks, forkSettings } from './forks-config'
import { isForkSetForNetworkId } from './is-fork-set-for-network-id'
import type { NetworkIds } from './network-ids'
import type { NetworkConfig, NetworkConfigHexId } from './networks-config'
import { networks, networksById } from './networks-config'

export const isTestnetEnabled = () => {
  const isDev = env.NODE_ENV === 'development'
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

const networksWithForksAtTheBeginning: NetworkConfig[] = [...forkNetworks, ...networks]

const networksSet = networksWithForksAtTheBeginning.reduce((acc, network) => {
  if (acc.some((n) => n.hexId === network.hexId)) {
    console.info('NetworkConfig with hexId ', network.hexId, ' already exists, skipping.')
    return acc
  }
  return [...acc, network]
}, [] as NetworkConfig[])

export const enableNetworksSet = networksSet.filter((network) => network.isEnabled())
export const networkSetByHexId = keyBy(enableNetworksSet, 'hexId')
export const networkSetById = keyBy(enableNetworksSet, 'id')
export const networkSetByName = keyBy(enableNetworksSet, 'name')

export const getOppositeNetworkHexIdByHexId = (currentConnectedChainHexId: NetworkConfigHexId) => {
  const networkConfig = networkSetByHexId[currentConnectedChainHexId]
  if (!networkConfig)
    console.info(
      'NetworkConfig not found for hexid ',
      currentConnectedChainHexId,
      ' using mainnet.',
    )
  return (
    (networkConfig &&
      (networkConfig.testnet ? networkConfig.mainnetHexId : networkConfig.testnetHexId)) ||
    networksById['1'].hexId
  )
}

export const shouldSetRequestedNetworkHexId = (
  current: NetworkConfigHexId | undefined,
  requested: NetworkConfigHexId | undefined,
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

export function getNetworkById(networkId: NetworkIds) {
  const base = networkSetById[networkId]

  if (!base)
    throw new Error(`Invalid contract chain id ${networkId} provided or not implemented yet`)

  const parent = base.getParentNetwork()

  if (parent && base.isCustomFork) return parent
  return base
}

export function getNetworksHexIdsByHexId(networkHexId: NetworkConfigHexId): NetworkConfigHexId[] {
  const base = networkSetByHexId[networkHexId]

  if (!base) throw new Error('Invalid contract chain id provided or not implemented yet')

  const testnet = base.testnetHexId
  const mainnet = base.mainnetHexId
  const parent = base.getParentNetwork()
  const baseHexs = [mainnet, testnet, base.hexId, parent?.hexId].filter(
    (id): id is NetworkConfigHexId => id !== undefined,
  )

  return Array.from(new Set(baseHexs))
}

export function getNetworkByName(networkName: NetworkNames) {
  // with forks we need to also check for {networkname}-test
  const base = networkSetByName[networkName] || networkSetByName[`${networkName}-test`]
  if (!base) throw new Error('Invalid network name provided or not implemented yet')

  const parent = base.getParentNetwork()

  if (parent && base.isCustomFork) return parent
  return base
}

export function isNetworkHexIdSupported(networkId: NetworkConfigHexId) {
  return !!networkSetByHexId[networkId]
}

export function NetworkIdToNetworkHexIds(networkId: NetworkIds): NetworkConfigHexId {
  return networkId.toString(16) as NetworkConfigHexId
}
