import type { NetworkConfigHexId } from 'blockchain/networks'
import { forksByParentHexId, networkSetByHexId } from 'blockchain/networks'

export function getNetworksFromPageNetwork(
  networkHexIds: NetworkConfigHexId[] | undefined,
  includeTestNet: boolean,
): NetworkConfigHexId[] | undefined {
  if (networkHexIds === undefined) return undefined

  const hexSet = new Set<NetworkConfigHexId | undefined>()

  networkHexIds.forEach((networkHexId) => {
    const networkConfig = networkSetByHexId[networkHexId]

    hexSet.add(networkConfig.mainnetHexId)
    if (includeTestNet) hexSet.add(networkConfig.testnetHexId)

    const parentNetwork = networkConfig.getParentNetwork()

    if (parentNetwork) {
      hexSet.add(parentNetwork.hexId)
      hexSet.add(parentNetwork.mainnetHexId)
      if (includeTestNet) hexSet.add(parentNetwork.testnetHexId)
    }

    const forkConfig = forksByParentHexId[networkHexId]

    if (forkConfig) {
      hexSet.add(forkConfig.hexId)
    }
  })

  return Array.from(hexSet).filter((hexId): hexId is NetworkConfigHexId => hexId !== undefined)
}
