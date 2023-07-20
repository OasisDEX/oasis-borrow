import { isNetworkHexIdSupported, NetworkConfigHexId } from 'blockchain/networks'
import { ReductoActions } from 'helpers/useReducto'
import { Reducer } from 'react'

import { BridgeConnector } from './bridge-connector'

// export type NetworkConnector = {
//   []
// }

export type ConnectingWallet = {
  type: 'connecting'
  networkHexId: NetworkConfigHexId
}

export type SettingChainWallet = {
  type: 'setting-chain'
  currentNetworkHexId: NetworkConfigHexId
  nextNetworkHexId: NetworkConfigHexId
}

export type ConnectedWallet = {
  type: 'connected'
  networkHexId: NetworkConfigHexId
  connector: BridgeConnector
  address: string
}

export type UnsupportedNetworkWallet = {
  type: 'unsupported-network'
  previousNetworkHexId: NetworkConfigHexId | undefined
  networkHexId: NetworkConfigHexId
}

export type DisconnectedWallet = {
  type: 'disconnected'
}

export type DisconnectingWallet = {
  type: 'disconnecting'
}

export type WalletManagementState =
  | ConnectedWallet
  | DisconnectedWallet
  | DisconnectingWallet
  | ConnectingWallet
  | SettingChainWallet
  | UnsupportedNetworkWallet

export type WalletStateAction = ReductoActions<
  WalletManagementState,
  | {
      type: 'CONNECT'
      networkHexId: NetworkConfigHexId
    }
  | {
      type: 'CONNECTED'
      connector: BridgeConnector
    }
  | {
      type: 'CHANGE_CHAIN'
      networkHexId: NetworkConfigHexId
    }
  | {
      type: 'DISCONNECTED'
    }
  | {
      type: 'REQUIRED_PAGE_NETWORK'
      networkHexId: NetworkConfigHexId
    }
  | {
      type: 'ERROR'
      error: unknown
    }
  | {
      type: 'WALLET_NETWORK_CHANGED'
      networkHexId: NetworkConfigHexId
    }
  | {
      type: 'CHANGE_WALLET_REJECTED'
      currentNetworkHexId: NetworkConfigHexId
      nextNetworkHexId: NetworkConfigHexId
    }
>

// function ensureCorrectState<TType extends WalletManagementState['type']>(
//   state: WalletManagementState,
//   type: TType,
// ): asserts state is Extract<WalletManagementState, { type: TType }> {
//   if (state.type !== type) {
//     throw new Error(`Invalid state: expected "${type}", got "${state.type}"`)
//   }
// }

export const walletStateReducer: Reducer<WalletManagementState, WalletStateAction> = (
  state: WalletManagementState,
  action: WalletStateAction,
) => {
  switch (action.type) {
    case 'CONNECT':
      return {
        type: 'connecting',
        networkHexId: action.networkHexId,
      }
    case 'CONNECTED':
      return {
        type: 'connected',
        connector: action.connector,
        networkHexId: action.connector.connectorInformation.hexChainId,
        address: action.connector.wallet.accounts[0].address,
      }
    case 'CHANGE_CHAIN':
      if (state.type === 'connected') {
        return {
          type: 'setting-chain',
          currentNetworkHexId: state.networkHexId,
          nextNetworkHexId: action.networkHexId,
        }
      }
      if (state.type === 'unsupported-network') {
        return {
          type: 'setting-chain',
          currentNetworkHexId: state.networkHexId,
          nextNetworkHexId: action.networkHexId,
        }
      }
      return {
        type: 'connecting',
        networkHexId: action.networkHexId,
      }
    case 'DISCONNECTED':
      return {
        type: 'disconnected',
      }
    case 'WALLET_NETWORK_CHANGED':
      switch (state.type) {
        case 'connected':
        case 'connecting':
          if (isNetworkHexIdSupported(action.networkHexId)) {
            return {
              type: 'connecting',
              networkHexId: action.networkHexId,
            }
          } else {
            return {
              type: 'unsupported-network',
              previousNetworkHexId: state.networkHexId,
              networkHexId: action.networkHexId,
            }
          }
        case 'disconnecting':
        case 'disconnected':
          if (isNetworkHexIdSupported(action.networkHexId)) {
            return {
              type: 'connecting',
              networkHexId: action.networkHexId,
            }
          } else {
            return {
              type: 'unsupported-network',
              previousNetworkHexId: undefined,
              networkHexId: action.networkHexId,
            }
          }
        default:
          return state
      }
    case 'CHANGE_WALLET_REJECTED':
      if (isNetworkHexIdSupported(action.currentNetworkHexId)) {
        return {
          type: 'connecting',
          networkHexId: action.currentNetworkHexId,
        }
      }
      return {
        type: 'unsupported-network',
        previousNetworkHexId: undefined,
        networkHexId: action.currentNetworkHexId,
      }
    default:
      return state
  }
}
