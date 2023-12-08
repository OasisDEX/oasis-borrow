import { forkSettings } from './forks-config'
import { isForkSetForNetworkId } from './is-fork-set-for-network-id'
import type { NetworkIds } from './network-ids'
import { networksById } from './networks-config'

export function getNetworkRpcEndpoint(networkId: NetworkIds) {
  const isForkSet = isForkSetForNetworkId(networkId)
  if (!networksById[networkId]) {
    throw new Error(`Invalid contract chain id (${networkId}) provided or not implemented yet`)
  }
  if (isForkSet) {
    const networkName = networksById[networkId].name
    return forkSettings[networkName]!.url
  }
  return networksById[networkId].rpcUrl
}
