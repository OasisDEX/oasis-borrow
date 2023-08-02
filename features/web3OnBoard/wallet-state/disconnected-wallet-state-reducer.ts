import { Reducer } from 'react'
import { match } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import { WalletManagementState, WalletManagementStateStatus } from './wallet-management-state'
import { WalletStateEvent, WalletStateEventType } from './wallet-state-event'

export const disconnectedWalletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state,
  event,
) => {
  ensureCorrectState(state, WalletManagementStateStatus.disconnecting)

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
