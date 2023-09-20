import type { Reducer } from 'react'
import { match } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import type { WalletManagementState } from './wallet-management-state'
import { WalletManagementStateStatus } from './wallet-management-state'
import type { WalletStateEvent } from './wallet-state-event'
import { WalletStateEventType } from './wallet-state-event'

export const disconnectedWalletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state,
  event,
) => {
  ensureCorrectState(state, WalletManagementStateStatus.disconnected)

  return match<WalletStateEvent, WalletManagementState>(event)
    .with({ type: WalletStateEventType.connect }, (event) => {
      return {
        ...state,
        status: WalletManagementStateStatus.connecting,
        desiredNetworkHexId: event.desiredNetworkHexId,
      }
    })
    .with({ type: WalletStateEventType.changeChain }, (event) => {
      return {
        ...state,
        status: WalletManagementStateStatus.connecting,
        desiredNetworkHexId: event.desiredNetworkHexId,
      }
    })
    .otherwise(() => state)
}
