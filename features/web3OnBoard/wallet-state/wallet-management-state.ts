import { NetworkConfigHexId } from 'blockchain/networks'
import { BridgeConnector } from 'features/web3OnBoard/bridge-connector'

export type ConnectingWallet = {
  status: 'connecting'
  desiredNetworkHexId?: NetworkConfigHexId
}
export type SettingChainWallet = {
  status: 'setting-chain'
  currentNetworkHexId: NetworkConfigHexId
  nextNetworkHexId: NetworkConfigHexId
  desiredNetworkHexId?: NetworkConfigHexId
}
export type ConnectedWallet = {
  status: 'connected'
  networkHexId: NetworkConfigHexId
  desiredNetworkHexId?: NetworkConfigHexId
  connector: BridgeConnector
  address: string
}
export type UnsupportedNetworkWallet = {
  status: 'unsupported-network'
  previousNetworkHexId: NetworkConfigHexId | undefined
  networkHexId: NetworkConfigHexId
  desiredNetworkHexId?: NetworkConfigHexId
}
export type DisconnectedWallet = {
  status: 'disconnected'
}
export type DisconnectingWallet = {
  status: 'disconnecting'
}
export type WalletManagementState =
  | ConnectedWallet
  | DisconnectedWallet
  | DisconnectingWallet
  | ConnectingWallet
  | SettingChainWallet
  | UnsupportedNetworkWallet
