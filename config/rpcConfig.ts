import { clientId } from 'helpers/clientId'

import { infuraProjectId } from './runtimeConfig'

function getRpc(network: string): string {
  if (process.env.APP_FULL_DOMAIN) {
    return `${process.env.APP_FULL_DOMAIN}/api/rpc?network=${network}&clientId=${clientId}`
  }
  try {
    return `${window?.location.origin}/api/rpc?network=${network}&clientId=${clientId}`
  } catch {
    return `https://${network}.infura.io/v3/${infuraProjectId}`
  }
}

export const mainnetRpc = getRpc('mainnet')
export const goerliRpc = getRpc('goerli')
