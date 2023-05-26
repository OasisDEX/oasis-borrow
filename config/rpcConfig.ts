import { clientId } from 'helpers/clientId'
import { NetworkNames } from 'helpers/networkNames'

import { infuraProjectId } from './runtimeConfig'

function getRpc(network: NetworkNames, tenderlySecret: string = ''): string {
  if (tenderlySecret !== '' && network === NetworkNames.ethereumMainnet) {
    network = NetworkNames.ethereumFork
  }
  if (process.env.APP_FULL_DOMAIN) {
    return `${process.env.APP_FULL_DOMAIN}/api/rpc?network=${network}&clientId=${clientId}&tenderlySecret=${tenderlySecret}`
  }
  try {
    return `${window?.location.origin}/api/rpc?network=${network}&clientId=${clientId}&tenderlySecret=${tenderlySecret}`
  } catch {
    return `https://${network}.infura.io/v3/${infuraProjectId}`
  }
}

export const getCustomForkRpcUrl = (secret: string) => {
  return getRpc(NetworkNames.ethereumFork, secret)
}
export const mainnetRpc = getRpc(NetworkNames.ethereumMainnet)
export const goerliRpc = getRpc(NetworkNames.ethereumGoerli)
export const arbitrumMainnetRpc = getRpc(NetworkNames.arbitrumMainnet)
export const arbitrumGoerliRpc = getRpc(NetworkNames.arbitrumGoerli)
export const polygonMainnetRpc = getRpc(NetworkNames.polygonMainnet)
export const polygonMumbaiRpc = getRpc(NetworkNames.polygonMumbai)
export const optimismMainnetRpc = getRpc(NetworkNames.optimismMainnet)
export const optimismGoerliRpc = getRpc(NetworkNames.optimismGoerli)
