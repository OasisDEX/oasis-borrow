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

export const connectingWalletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state: WalletManagementState,
  event: WalletStateEvent,
) => {
  ensureCorrectState(state, WalletManagementStateStatus.connecting)

  return match<WalletStateEvent, WalletManagementState>(event)
    .with(
      {
        type: WalletStateEventType.connected,
        connector: P.when((connector) => !canTransitWithNetworkHexId(connector.hexChainId, state)),
      },
      (event) => {
        return {
          ...state,
          status: WalletManagementStateStatus.unsupportedNetwork,
          desiredNetworkHexId: getDesiredNetworkHexId(state),
          walletNetworkHexId: event.connector.hexChainId,
        }
      },
    )
    .with({ type: WalletStateEventType.connected }, (event) => {
      return {
        ...state,
        status: WalletManagementStateStatus.connected,
        connector: event.connector,
        walletNetworkHexId: event.connector.hexChainId,
      }
    })
    .with({ type: WalletStateEventType.connectionCancelled }, () => {
      return {
        ...state,
        status: WalletManagementStateStatus.disconnected,
      }
    })
    .otherwise(() => state)
}
