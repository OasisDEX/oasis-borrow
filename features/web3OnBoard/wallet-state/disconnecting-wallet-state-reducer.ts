import { Reducer } from 'react'
import { ensureCorrectState } from 'features/web3OnBoard/wallet-state/ensure-correct-state'
import { WalletManagementState, WalletManagementStateStatus } from 'features/web3OnBoard/wallet-state/wallet-management-state'
import { WalletStateEvent, WalletStateEventType } from 'features/web3OnBoard/wallet-state/wallet-state-event'
import { match } from 'ts-pattern'

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
