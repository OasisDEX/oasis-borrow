import { NetworkConnector } from '@web3-react/network-connector'
import { NetworkConfigHexId, NetworkHexIds, NetworkIds } from 'blockchain/networks'
import { BridgeConnector } from 'features/web3OnBoard/bridge-connector'

export type WalletManagementStateContext = {
  connector?: BridgeConnector
  desiredNetworkHexId?: NetworkConfigHexId
  walletNetworkHexId?: NetworkConfigHexId
  pageNetworkHexIds?: NetworkConfigHexId[]
  networkConnector?: NetworkConnector
  networkConnectorNetworkId?: NetworkIds
}

export type WalletManagementState =
  | ({ status: 'connecting' } & WalletManagementStateContext)
  | ({ status: 'disconnected' } & WalletManagementStateContext)
  | ({ status: 'disconnecting' } & WalletManagementStateContext & {
        walletNetworkHexId: NetworkConfigHexId
      })
  | ({ status: 'connected' } & WalletManagementStateContext & {
        connector: BridgeConnector
        walletNetworkHexId: NetworkConfigHexId
      })
  | ({ status: 'setting-chain' } & WalletManagementStateContext & {
        desiredNetworkHexId: NetworkConfigHexId
        walletNetworkHexId: NetworkConfigHexId
      })
  | ({ status: 'unsupported-network' } & WalletManagementStateContext & {
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
