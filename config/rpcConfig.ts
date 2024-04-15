import { NetworkNames } from 'blockchain/networks/network-names'
import { clientId } from 'helpers/clientId'

import { infuraProjectId } from './runtimeConfig'

function getRpc(network: NetworkNames): string {
  let rpcUrl: string
  try {
    rpcUrl = `${window?.location.origin}/api/rpcGateway?network=${network}&clientId=${clientId}`
  } catch (error) {
    rpcUrl = `https://${network}.infura.io/v3/${infuraProjectId}`
  }
  return rpcUrl
}

export const mainnetRpc = getRpc(NetworkNames.ethereumMainnet)
export const goerliRpc = getRpc(NetworkNames.ethereumGoerli)
export const arbitrumMainnetRpc = getRpc(NetworkNames.arbitrumMainnet)
export const arbitrumGoerliRpc = getRpc(NetworkNames.arbitrumGoerli)
export const polygonMainnetRpc = getRpc(NetworkNames.polygonMainnet)
export const polygonMumbaiRpc = getRpc(NetworkNames.polygonMumbai)
export const optimismMainnetRpc = getRpc(NetworkNames.optimismMainnet)
export const optimismGoerliRpc = getRpc(NetworkNames.optimismGoerli)
export const baseMainnetRpc = getRpc(NetworkNames.baseMainnet)
export const baseGoerliRpc = getRpc(NetworkNames.baseGoerli)
