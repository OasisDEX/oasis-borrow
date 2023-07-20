import { Reducer } from 'react'
import { match } from 'ts-pattern'

import { connectedWalletStateReducer } from './connected-wallet-state-reducer'
import { connectingWalletStateReducer } from './connecting-wallet-state-reducer'
import { disconnectedWalletStateReducer } from './disconnected-wallet-state-reducer'
import { disconnectingWalletStateReducer } from './disconnecting-wallet-state-reducer'
import { settingChainWalletStateReducer } from './setting-chain-wallet-state-reducer'
import { unsupportedNetworkWalletStateReducer } from './unsupported-network-wallet-state-reducer'
import { WalletManagementState } from './wallet-management-state'
import { WalletStateEvent } from './wallet-state-event'

export const walletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state: WalletManagementState,
  event: WalletStateEvent,
) => {
  return match<WalletManagementState, WalletManagementState>(state)
    .with({ status: 'connected' }, (state) => {
      return connectedWalletStateReducer(state, event)
    })
    .with({ status: 'connecting' }, (state) => {
      return connectingWalletStateReducer(state, event)
    })
    .with({ status: 'setting-chain' }, (state) => {
      return settingChainWalletStateReducer(state, event)
    })
    .with({ status: 'unsupported-network' }, (state) => {
      return unsupportedNetworkWalletStateReducer(state, event)
    })
    .with({ status: 'disconnecting' }, (state) => {
      return disconnectingWalletStateReducer(state, event)
    })
    .with({ status: 'disconnected' }, (state) => {
      return disconnectedWalletStateReducer(state, event)
    })
    .exhaustive()

  // switch (event.type) {
  //   case 'CONNECT':
  //     return handleConnectAction(state, event)
  //   case 'CONNECTED':
  //     if (
  //       state.type === 'connecting' &&
  //       state.desiredNetworkHexId &&
  //       event.connector.hexChainId !== state.desiredNetworkHexId
  //     ) {
  //       return {
  //         type: 'setting-chain',
  //         currentNetworkHexId: event.connector.hexChainId,
  //         nextNetworkHexId: state.desiredNetworkHexId,
  //       }
  //     }
  //     return {
  //       type: 'connected',
  //       connector: event.connector,
  //       networkHexId: event.connector.hexChainId,
  //       address: event.connector.connectedAccount,
  //     }
  //   case 'CHANGE_CHAIN':
  //     if (state.type === 'connected') {
  //       return {
  //         type: 'setting-chain',
  //         currentNetworkHexId: state.networkHexId,
  //         nextNetworkHexId: event.networkHexId,
  //       }
  //     }
  //     if (state.type === 'unsupported-network') {
  //       return {
  //         type: 'setting-chain',
  //         currentNetworkHexId: state.networkHexId,
  //         nextNetworkHexId: event.networkHexId,
  //       }
  //     }
  //     return {
  //       type: 'connecting',
  //     }
  //   case 'DISCONNECTED':
  //     return {
  //       type: 'disconnected',
  //     }
  //   case 'WALLET_NETWORK_CHANGED':
  //     switch (state.type) {
  //       case 'connected':
  //       case 'connecting':
  //       case 'disconnecting':
  //       case 'disconnected':
  //         if (isNetworkHexIdSupported(event.networkHexId)) {
  //           return {
  //             type: 'connecting',
  //             networkHexId: event.networkHexId,
  //           }
  //         } else {
  //           return {
  //             type: 'unsupported-network',
  //             previousNetworkHexId: undefined,
  //             networkHexId: event.networkHexId,
  //           }
  //         }
  //       default:
  //         return state
  //     }
  //   case 'CHANGE_WALLET_REJECTED':
  //     if (
  //       state.type === 'setting-chain' &&
  //       state.desiredNetworkHexId !== event.currentNetworkHexId
  //     ) {
  //       return {
  //         type: 'unsupported-network',
  //         previousNetworkHexId: state.desiredNetworkHexId,
  //         networkHexId: event.currentNetworkHexId,
  //       }
  //     }
  //
  //     if (isNetworkHexIdSupported(event.currentNetworkHexId)) {
  //       return {
  //         type: 'connecting',
  //         networkHexId: event.currentNetworkHexId,
  //       }
  //     }
  //     return {
  //       type: 'unsupported-network',
  //       previousNetworkHexId: undefined,
  //       networkHexId: event.currentNetworkHexId,
  //     }
  //   default:
  //     return state
  // }
}
