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

export const getOppositeNetworkHexIdByHexId = (
  currentConnectedChainHexId: ConnectedChain['id'],
) => {
  const networksListByHexId = { ...networksByHexId, ...keyBy(hardhatNetworkConfigs, 'hexId') }
  return (
    networksListByHexId[currentConnectedChainHexId].testnetHexId ||
    networksListByHexId[currentConnectedChainHexId].mainnetHexId
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
  if (!networksById[networkId]) {
    throw new Error('Invalid contract chain id provided or not implemented yet')
  }
  return isTestnet
    ? networksById[networksById[networkId].testnetId!].rpcUrl
    : networksById[networkId].rpcUrl
}
