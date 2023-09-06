import { Reducer } from 'react'
import { ensureCorrectState } from 'features/web3OnBoard/wallet-state/ensure-correct-state'
import {
  getDesiredNetworkHexId,
  WalletManagementState,
  WalletManagementStateStatus,
} from 'features/web3OnBoard/wallet-state/wallet-management-state'
import { WalletStateEvent, WalletStateEventType } from 'features/web3OnBoard/wallet-state/wallet-state-event'
import { canTransitWithNetworkHexId } from 'features/web3OnBoard/wallet-state/wallet-state-guards'
import { match, P } from 'ts-pattern'

export const settingChainWalletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state,
  event,
) => {
  ensureCorrectState(state, WalletManagementStateStatus.settingChain)

  return match<WalletStateEvent, WalletManagementState>(event)
    .with(
      {
        type: WalletStateEventType.changeWalletRejected,
        walletNetworkHexId: P.when((hexId) => !canTransitWithNetworkHexId(hexId, state)),
      },
      () => {
        return {
          ...state,
          status: WalletManagementStateStatus.unsupportedNetwork,
          desiredNetworkHexId: getDesiredNetworkHexId(state),
        }
      },
    )
    .with(
      {
        type: WalletStateEventType.changeWalletRejected,
      },
      (event) => {
        return {
          ...state,
          status: WalletManagementStateStatus.connecting,
          desiredNetworkHexId: event.walletNetworkHexId,
        }
      },
    )
    .with(
      {
        type: WalletStateEventType.walletNetworkChanged,
        networkHexId: P.when((hexId) => !canTransitWithNetworkHexId(hexId, state)),
      },
      (event) => {
        return {
          ...state,
          status: WalletManagementStateStatus.unsupportedNetwork,
          walletNetworkHexId: event.networkHexId,
          desiredNetworkHexId: getDesiredNetworkHexId(state),
        }
      },
    )
    .with({ type: WalletStateEventType.walletNetworkChanged }, (event) => {
      return {
        ...state,
        status: WalletManagementStateStatus.connecting,
        walletNetworkHexId: event.networkHexId,
        desiredNetworkHexId: event.networkHexId,
      }
    })
    .otherwise(() => state)
}
