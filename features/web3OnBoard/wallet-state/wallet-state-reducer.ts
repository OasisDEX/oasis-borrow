import { Reducer } from 'react'
import { connectedWalletStateReducer } from 'features/web3OnBoard/wallet-state/connected-wallet-state-reducer'
import { connectingWalletStateReducer } from 'features/web3OnBoard/wallet-state/connecting-wallet-state-reducer'
import { disconnectedWalletStateReducer } from 'features/web3OnBoard/wallet-state/disconnected-wallet-state-reducer'
import { disconnectingWalletStateReducer } from 'features/web3OnBoard/wallet-state/disconnecting-wallet-state-reducer'
import { settingChainWalletStateReducer } from 'features/web3OnBoard/wallet-state/setting-chain-wallet-state-reducer'
import { unsupportedNetworkWalletStateReducer } from 'features/web3OnBoard/wallet-state/unsupported-network-wallet-state-reducer'
import {
  WalletManagementState,
  WalletManagementStateStatus,
} from 'features/web3OnBoard/wallet-state/wallet-management-state'
import { WalletStateEvent } from 'features/web3OnBoard/wallet-state/wallet-state-event'
import { match } from 'ts-pattern'

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
