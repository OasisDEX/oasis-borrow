import type { NetworkConfigHexId } from 'blockchain/networks'
import { isNetworkHexIdSupported, networkSetByHexId } from 'blockchain/networks'

import { ensureCorrectState } from './ensure-correct-state'
import type { WalletManagementState } from './wallet-management-state'
import { WalletManagementStateStatus } from './wallet-management-state'

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

export function shouldSendChangeNetworkOnConnected(
  desiredNetworkHexId: NetworkConfigHexId,
  state: WalletManagementState,
  couldBeConnectedToTestNet: boolean,
) {
  ensureCorrectState(state, WalletManagementStateStatus.connected)
  if (desiredNetworkHexId === undefined) {
    return false
  }

  if (state.pageNetworkHexIds) {
    return !state.pageNetworkHexIds.includes(state.walletNetworkHexId)
  }

  const desiredNetworkConfig = networkSetByHexId[desiredNetworkHexId]

  const possibleNetworkHexIds = [desiredNetworkConfig.mainnetHexId]
  if (couldBeConnectedToTestNet) {
    possibleNetworkHexIds.push(desiredNetworkConfig.testnetHexId)
  }

  return !possibleNetworkHexIds.includes(state.walletNetworkHexId)
}
