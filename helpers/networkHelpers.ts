import { ConnectedChain } from '@web3-onboard/core'
import { NetworkIds } from 'blockchain/networkIds'
import {
  NetworkConfig,
  NetworkConfigHexId,
  networks,
  networksByHexId,
  networksById,
} from 'blockchain/networksConfig'
import { hardhatNetworkConfigs } from 'features/web3OnBoard/hardhatConfigList'
import { hardhatSettings } from 'features/web3OnBoard/hardhatConfigList'
import { keyBy } from 'lodash'
import { env } from 'process'

import { mainnetNetworkParameter } from './getCustomNetworkParameter'
import { CustomNetworkStorageKey } from './getCustomNetworkParameter'
import { getStorageValue } from './useLocalStorage'

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

export const isHardhatSetForNetworkId = (networkId: NetworkIds) => {
  const networkName = networksById[networkId]?.name
  return !!hardhatSettings[networkName]
}

export const getOppositeNetworkHexIdByHexId = (
  currentConnectedChainHexId: ConnectedChain['id'],
) => {
  const networksListByHexId = { ...networksByHexId, ...keyBy(hardhatNetworkConfigs, 'hexId') }
  const networkConfig = networksListByHexId[currentConnectedChainHexId]
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
  if (!isTestnetNetworkId(walletChainId) && isHardhatSetForNetworkId(contractChainId)) {
    const networkName = networksById[contractChainId].name
    return Number(hardhatSettings[networkName]!.id) as NetworkIds
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
  const isHardhatSet = isHardhatSetForNetworkId(networkId)
  if (!networksById[networkId]) {
    throw new Error('Invalid contract chain id provided or not implemented yet')
  }
  if (isHardhatSet) {
    const networkName = networksById[networkId].name
    return hardhatSettings[networkName]!.url
  }
  return isTestnet
    ? networksById[networksById[networkId].testnetId!].rpcUrl
    : networksById[networkId].rpcUrl
}
