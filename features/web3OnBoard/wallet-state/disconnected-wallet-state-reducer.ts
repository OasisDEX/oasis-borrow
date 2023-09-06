import { Reducer } from 'react'
import { ensureCorrectState } from 'features/web3OnBoard/wallet-state/ensure-correct-state'
import { WalletManagementState, WalletManagementStateStatus } from 'features/web3OnBoard/wallet-state/wallet-management-state'
import { WalletStateEvent, WalletStateEventType } from 'features/web3OnBoard/wallet-state/wallet-state-event'
import { match } from 'ts-pattern'

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
