import { Reducer } from 'react'
import { match, P } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import { getDesiredNetworkHexId, WalletManagementState } from './wallet-management-state'
import { WalletStateEvent } from './wallet-state-event'
import { canTransitWithNetworkHexId } from './wallet-state-guards'

export const connectingWalletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state: WalletManagementState,
  event: WalletStateEvent,
) => {
  ensureCorrectState(state, 'connecting')

  return match<WalletStateEvent, WalletManagementState>(event)
    .with(
      {
        type: 'connected',
        connector: P.when((connector) => !canTransitWithNetworkHexId(connector.hexChainId, state)),
      },
      (event) => {
        return {
          ...state,
          status: 'unsupported-network',
          desiredNetworkHexId: getDesiredNetworkHexId(state),
          walletNetworkHexId: event.connector.hexChainId,
        }
      },
    )
    .with({ type: 'connected' }, (event) => {
      return {
        ...state,
        status: 'connected',
        connector: event.connector,
        walletNetworkHexId: event.connector.hexChainId,
      }
    })
    .otherwise(() => state)
}
