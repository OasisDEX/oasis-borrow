import type { Reducer } from 'react'
import { match, P } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import type { WalletManagementState } from './wallet-management-state'
import { getDesiredNetworkHexId, WalletManagementStateStatus } from './wallet-management-state'
import type { WalletStateEvent } from './wallet-state-event'
import { WalletStateEventType } from './wallet-state-event'
import { canTransitWithNetworkHexId } from './wallet-state-guards'

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
