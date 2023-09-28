import { forkSettings } from './forks-config'
import type { NetworkIds } from './network-ids'
import { networksById } from './networks-config'

export const isForkSetForNetworkId = (networkId: NetworkIds) => {
  const networkName = networksById[networkId]?.name
  return forkSettings[networkName] !== undefined
}
