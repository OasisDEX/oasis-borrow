import { isNetworkHexIdSupported, NetworkConfigHexId } from 'blockchain/networks'

import { WalletManagementState } from './wallet-management-state'

export function canTransitWithNetworkHexId(
  hexId: NetworkConfigHexId | undefined,
  state: WalletManagementState,
) {
  if (hexId === undefined) {
    return false
  }

  if (state.pageNetworkHexIds === undefined) {
    return isNetworkHexIdSupported(hexId)
  }

  return state.pageNetworkHexIds.includes(hexId)
}
