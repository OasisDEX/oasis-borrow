import { clientId } from 'helpers/clientId'
import { NetworkNames } from 'helpers/networkNames'

import { infuraProjectId } from './runtimeConfig'

function getRpc(network: NetworkNames, isTesting : boolean = false): string {
  if(isTesting && network === NetworkNames.ethereumMainnet) {
    network = NetworkNames.ethereumTenderly;
  }
  if (process.env.APP_FULL_DOMAIN) {
    return `${process.env.APP_FULL_DOMAIN}/api/rpc?network=${network}&clientId=${clientId}&isTesting=${isTesting}`
  }
  try {
    return `${window?.location.origin}/api/rpc?network=${network}&clientId=${clientId}&isTesting=${isTesting}`
  } catch {
    return `https://${network}.infura.io/v3/${infuraProjectId}`
  }
}

export const mainnetRpc = getRpc(NetworkNames.ethereumMainnet)
export const mainnetTenderlyRpc = getRpc(NetworkNames.ethereumTenderly)
export const goerliRpc = getRpc(NetworkNames.ethereumGoerli)
export const arbitrumMainnetRpc = getRpc(NetworkNames.arbitrumMainnet)
export const arbitrumGoerliRpc = getRpc(NetworkNames.arbitrumGoerli)
export const polygonMainnetRpc = getRpc(NetworkNames.polygonMainnet)
export const polygonMumbaiRpc = getRpc(NetworkNames.polygonMumbai)
export const optimismMainnetRpc = getRpc(NetworkNames.optimismMainnet)
export const optimismGoerliRpc = getRpc(NetworkNames.optimismGoerli)
