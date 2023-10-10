import type { Reducer } from 'react'
import { match } from 'ts-pattern'

import { connectedWalletStateReducer } from './connected-wallet-state-reducer'
import { connectingWalletStateReducer } from './connecting-wallet-state-reducer'
import { disconnectedWalletStateReducer } from './disconnected-wallet-state-reducer'
import { disconnectingWalletStateReducer } from './disconnecting-wallet-state-reducer'
import { settingChainWalletStateReducer } from './setting-chain-wallet-state-reducer'
import { unsupportedNetworkWalletStateReducer } from './unsupported-network-wallet-state-reducer'
import type { WalletManagementState } from './wallet-management-state'
import { WalletManagementStateStatus } from './wallet-management-state'
import type { WalletStateEvent } from './wallet-state-event'

export const walletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state: WalletManagementState,
  event: WalletStateEvent,
) => {
  return match<WalletManagementState, WalletManagementState>(state)
    .with({ status: WalletManagementStateStatus.connected }, (state) => {
      return connectedWalletStateReducer(state, event)
    })
    .with({ status: WalletManagementStateStatus.connecting }, (state) => {
      return connectingWalletStateReducer(state, event)
    })
    .with({ status: WalletManagementStateStatus.settingChain }, (state) => {
      return settingChainWalletStateReducer(state, event)
    })
    .with({ status: WalletManagementStateStatus.unsupportedNetwork }, (state) => {
      return unsupportedNetworkWalletStateReducer(state, event)
    })
    .with({ status: WalletManagementStateStatus.disconnecting }, (state) => {
      return disconnectingWalletStateReducer(state, event)
    })
    .with({ status: WalletManagementStateStatus.disconnected }, (state) => {
      return disconnectedWalletStateReducer(state, event)
    })
    .exhaustive()
}
