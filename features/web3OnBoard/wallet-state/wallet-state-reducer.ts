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
}
