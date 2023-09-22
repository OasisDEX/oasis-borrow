import type { Reducer } from 'react'
import { match } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import type { WalletManagementState } from './wallet-management-state'
import { WalletManagementStateStatus } from './wallet-management-state'
import type { WalletStateEvent } from './wallet-state-event'
import { WalletStateEventType } from './wallet-state-event'

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
