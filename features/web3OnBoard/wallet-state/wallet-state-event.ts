import type { NetworkConfigHexId } from 'blockchain/networks'
import type { BridgeConnector } from 'features/web3OnBoard/bridge-connector'
import type { ReductoActions } from 'helpers/useReducto'

import type { WalletManagementState } from './wallet-management-state'

export enum WalletStateEventType {
  connect = 'connect',
  connectionCancelled = 'connection-cancelled',
  connected = 'connected',
  changeChain = 'change-chain',
  toggleBetweenMainnetAndTestnet = 'toggle-between-mainnet-and-testnet',
  disconnect = 'disconnect',
  disconnected = 'disconnected',
  error = 'error',
  walletNetworkChanged = 'wallet-network-changed',
  changeWalletRejected = 'change-wallet-rejected',
}

export type WalletStateEvent = ReductoActions<
  WalletManagementState,
  | {
      type: WalletStateEventType.connect
      desiredNetworkHexId?: NetworkConfigHexId
      couldBeConnectedToTestNet?: boolean
    }
  | {
      type: WalletStateEventType.connectionCancelled
    }
  | {
      type: WalletStateEventType.connected
      connector: BridgeConnector
    }
  | {
      type: WalletStateEventType.changeChain
      desiredNetworkHexId: NetworkConfigHexId
      couldBeConnectedToTestNet?: boolean
    }
  | {
      type: WalletStateEventType.disconnect
    }
  | {
      type: WalletStateEventType.disconnected
    }
  | {
      type: WalletStateEventType.error
      error: unknown
    }
  | {
      type: WalletStateEventType.walletNetworkChanged
      networkHexId: NetworkConfigHexId
    }
  | {
      type: WalletStateEventType.changeWalletRejected
      walletNetworkHexId: NetworkConfigHexId
      desiredNetworkHexId: NetworkConfigHexId
    }
  | {
      type: WalletStateEventType.toggleBetweenMainnetAndTestnet
    }
>
