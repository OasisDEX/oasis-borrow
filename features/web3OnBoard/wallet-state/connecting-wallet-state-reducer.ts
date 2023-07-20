import { Reducer } from 'react'
import { match } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import { WalletManagementState } from './wallet-management-state'
import { WalletStateEvent } from './wallet-state-event'

export const connectingWalletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state: WalletManagementState,
  event: WalletStateEvent,
) => {
  ensureCorrectState(state, 'connecting')

  return (
    match<WalletStateEvent, WalletManagementState>(event)
      // .with({ type: 'connect' }, () => {
      //   return state
      // })
      // .with(
      //   {
      //     type: 'connected',
      //     connector: P.when(
      //       (connector) =>
      //         state.desiredNetworkHexId && state.desiredNetworkHexId !== connector.hexChainId,
      //     ),
      //   },
      //   (event) => {
      //     return {
      //       status: 'setting-chain',
      //       currentNetworkHexId: event.connector.hexChainId,
      //       nextNetworkHexId: state.desiredNetworkHexId!,
      //       desiredNetworkHexId: state.desiredNetworkHexId,
      //     }
      //   },
      // )
      .with({ type: 'connected' }, (event) => {
        return {
          status: 'connected',
          connector: event.connector,
          networkHexId: event.connector.hexChainId,
          address: event.connector.connectedAccount,
          desiredNetworkHexId: state.desiredNetworkHexId,
        }
      })
      .with({ type: 'disconnect' }, () => {
        return {
          status: 'disconnecting',
        }
      })
      .otherwise(() => state)
  )
}
