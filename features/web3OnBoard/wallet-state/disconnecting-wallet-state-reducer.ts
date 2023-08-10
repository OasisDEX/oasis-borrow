import { Reducer } from 'react'
import { match } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import { WalletManagementState, WalletManagementStateStatus } from './wallet-management-state'
import { WalletStateEvent, WalletStateEventType } from './wallet-state-event'

export const disconnectingWalletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state,
  event,
) => {
  ensureCorrectState(state, WalletManagementStateStatus.disconnecting)

  return match<WalletStateEvent, WalletManagementState>(event)
    .with({ type: WalletStateEventType.disconnected }, () => {
      return {
        ...state,
        connector: undefined,
        status: WalletManagementStateStatus.disconnected,
      }
    })
    .otherwise(() => state)
}
