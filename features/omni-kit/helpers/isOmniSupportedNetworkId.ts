import type { NetworkIds } from 'blockchain/networks'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'

export function isOmniSupportedNetworkId(
  value: NetworkIds,
  arr: NetworkIds[],
): value is OmniSupportedNetworkIds {
  return arr.includes(value)
}
