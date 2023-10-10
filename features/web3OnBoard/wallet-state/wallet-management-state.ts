import type { NetworkConnector } from '@web3-react/network-connector'
import type { NetworkConfigHexId, NetworkIds } from 'blockchain/networks'
import { NetworkHexIds } from 'blockchain/networks'
import type { BridgeConnector } from 'features/web3OnBoard/bridge-connector'

export enum WalletManagementStateStatus {
  connecting = 'connecting',
  disconnected = 'disconnected',
  disconnecting = 'disconnecting',
  connected = 'connected',
  settingChain = 'setting-chain',
  unsupportedNetwork = 'unsupported-network',
}

export type WalletManagementStateContext = {
  connector?: BridgeConnector
  desiredNetworkHexId?: NetworkConfigHexId
  walletNetworkHexId?: NetworkConfigHexId
  pageNetworkHexIds?: NetworkConfigHexId[]
  networkConnector?: NetworkConnector
  networkConnectorNetworkId: NetworkIds
}

export type WalletManagementState =
  | ({ status: WalletManagementStateStatus.connecting } & WalletManagementStateContext)
  | ({ status: WalletManagementStateStatus.disconnected } & WalletManagementStateContext)
  | ({ status: WalletManagementStateStatus.disconnecting } & WalletManagementStateContext & {
        walletNetworkHexId: NetworkConfigHexId
      })
  | ({ status: WalletManagementStateStatus.connected } & WalletManagementStateContext & {
        connector: BridgeConnector
        walletNetworkHexId: NetworkConfigHexId
      })
  | ({ status: WalletManagementStateStatus.settingChain } & WalletManagementStateContext & {
        desiredNetworkHexId: NetworkConfigHexId
        walletNetworkHexId: NetworkConfigHexId
      })
  | ({ status: WalletManagementStateStatus.unsupportedNetwork } & WalletManagementStateContext & {
        desiredNetworkHexId: NetworkConfigHexId
        walletNetworkHexId: NetworkConfigHexId
      })

export function getDesiredNetworkHexId(state: WalletManagementState): NetworkConfigHexId {
  if (state.pageNetworkHexIds && state.pageNetworkHexIds.length > 0) {
    return state.pageNetworkHexIds[0] // let's assume that the first network is the desired one
  }
  return state.desiredNetworkHexId || state.walletNetworkHexId || NetworkHexIds.MAINNET // fallback to mainnet
}

export function areThePageNetworksTheSame(
  pageNetworkHexIds: NetworkConfigHexId[] | undefined,
  state: WalletManagementState,
) {
  if (pageNetworkHexIds === undefined && state.pageNetworkHexIds === undefined) {
    return true
  }

  if (pageNetworkHexIds && state.pageNetworkHexIds) {
    return (
      pageNetworkHexIds.length === state.pageNetworkHexIds.length &&
      pageNetworkHexIds.every((hexId) => state.pageNetworkHexIds?.includes(hexId))
    )
  }

  return false
}
