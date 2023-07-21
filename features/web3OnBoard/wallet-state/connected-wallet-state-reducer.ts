import { Reducer } from 'react'
import { match, P } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import { getDesiredNetworkHexId, WalletManagementState } from './wallet-management-state'
import { WalletStateEvent } from './wallet-state-event'
import { canTransitWithNetworkHexId } from './wallet-state-guards'

export const connectedWalletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state: WalletManagementState,
  event: WalletStateEvent,
) => {
  ensureCorrectState(state, 'connected')

  return match<WalletStateEvent, WalletManagementState>(event)
    .with({ type: 'disconnect' }, () => {
      return {
        ...state,
        status: 'disconnecting',
      }
    })
    .with(
      {
        type: 'change-chain',
        desiredNetworkHexId: P.when((hexId) => hexId !== state.walletNetworkHexId),
      },
      (event) => {
        return {
          ...state,
          desiredNetworkHexId: event.desiredNetworkHexId,
          status: 'setting-chain',
        }
      },
    )
    .with(
      {
        type: 'wallet-network-changed',
        networkHexId: P.when((hexId) => !canTransitWithNetworkHexId(hexId, state)),
      },
      (event) => {
        return {
          ...state,
          walletNetworkHexId: event.networkHexId,
          desiredNetworkHexId: getDesiredNetworkHexId(state),
          status: 'unsupported-network',
        }
      },
    )
    .with(
      {
        type: 'wallet-network-changed',
        networkHexId: P.when((hexId) => state.connector.hexChainId !== hexId),
      },
      (event) => {
        return {
          ...state,
          status: 'connecting',
          desiredNetworkHexId: event.networkHexId,
        }
      },
    )
    .otherwise(() => state)
}
