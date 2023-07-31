import { NetworkConfigHexId } from 'blockchain/networks'
import { BridgeConnector } from 'features/web3OnBoard/bridge-connector'
import { ReductoActions } from 'helpers/useReducto'

import { WalletManagementState } from './wallet-management-state'

export type WalletStateEvent = ReductoActions<
  WalletManagementState,
  | {
      type: 'connect'
      desiredNetworkHexId?: NetworkConfigHexId
    }
  | {
      type: 'connection-cancelled'
    }
  | {
      type: 'connected'
      connector: BridgeConnector
    }
  | {
      type: 'change-chain'
      desiredNetworkHexId: NetworkConfigHexId
    }
  | {
      type: 'disconnect'
    }
  | {
      type: 'disconnected'
    }
  | {
      type: 'error'
      error: unknown
    }
  | {
      type: 'wallet-network-changed'
      networkHexId: NetworkConfigHexId
    }
  | {
      type: 'change-wallet-rejected'
      walletNetworkHexId: NetworkConfigHexId
      desiredNetworkHexId: NetworkConfigHexId
    }
>
