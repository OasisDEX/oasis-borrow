import { Reducer } from 'react'
import { match } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import { WalletManagementState } from './wallet-management-state'
import { WalletStateEvent } from './wallet-state-event'

export const disconnectedWalletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state,
  event,
) => {
  ensureCorrectState(state, 'disconnected')

  return match<WalletStateEvent, WalletManagementState>(event)
    .with({ type: 'connect' }, (event) => {
      return {
        ...state,
        status: 'connecting',
        desiredNetworkHexId: event.desiredNetworkHexId,
      }
    })
    .with({ type: 'change-chain' }, (event) => {
      return {
        ...state,
        status: 'connecting',
        desiredNetworkHexId: event.desiredNetworkHexId,
      }
    })
    .otherwise(() => state)
}
