import { NetworkConfigHexId } from 'blockchain/networks'
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
  networkHexId: NetworkConfigHexId
}

export type ConnectedWallet = {
  type: 'connected'
  networkHexId: NetworkConfigHexId
  connector: BridgeConnector
  address: string
}

export type DisconnectedWallet = {
  type: 'disconnected'
}

export type WalletManagementState =
  | ConnectedWallet
  | DisconnectedWallet
  | ConnectingWallet
  | SettingChainWallet

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
>

function ensureCorrectState<TType extends WalletManagementState['type']>(
  state: WalletManagementState,
  type: TType,
): asserts state is Extract<WalletManagementState, { type: TType }> {
  if (state.type !== type) {
    throw new Error(`Invalid state: expected "${type}", got "${state.type}"`)
  }
}
//
// const connectingReducer = (
//   state: WalletManagementState,
//   action: WalletStateAction,
// ): WalletManagementState => {
//   ensureCorrectState(state, 'connecting')
//   switch (action.type) {
//     case 'CONNECTED':
//       return {
//         type: 'connected',
//         connector: action.connector,
//         networkHexId: action.connector.basicInfo.hexChainId,
//         address: action.connector.wallet.accounts[0].address,
//       }
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
        networkHexId: action.connector.basicInfo.hexChainId,
        address: action.connector.wallet.accounts[0].address,
      }
    case 'CHANGE_CHAIN':
      return {
        type: 'setting-chain',
        networkHexId: action.networkHexId,
      }
    case 'DISCONNECTED':
      return {
        type: 'disconnected',
      }
    default:
      return state
  }
}
