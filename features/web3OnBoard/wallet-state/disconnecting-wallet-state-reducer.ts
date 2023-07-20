import { Reducer } from 'react'
import { match } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import { WalletManagementState } from './wallet-management-state'
import { WalletStateEvent } from './wallet-state-event'

export const disconnectingWalletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state,
  event,
) => {
  ensureCorrectState(state, 'disconnecting')

  return match<WalletStateEvent, WalletManagementState>(event)
    .with({ type: 'disconnected' }, () => {
      return {
        status: 'disconnected',
      }
    })
    .otherwise(() => state)
}
