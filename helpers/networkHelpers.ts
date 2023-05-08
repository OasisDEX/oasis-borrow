import { ConnectedChain } from '@web3-onboard/core'
import { NetworkIds } from 'blockchain/networkIds'
import {
  NetworkConfig,
  NetworkConfigHexId,
  networks,
  networksByHexId,
  networksById,
} from 'blockchain/networksConfig'
import { env } from 'process'

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

export const getOppositeNetworkHexIdByHexId = (
  currentConnectedChainHexId: ConnectedChain['id'],
) => {
  return (
    networksByHexId[currentConnectedChainHexId].testnetHexId ||
    networksByHexId[currentConnectedChainHexId].mainnetHexId
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
