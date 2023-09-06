import { Reducer } from 'react'
import { ensureCorrectState } from 'features/web3OnBoard/wallet-state/ensure-correct-state'
import {
  WalletManagementState,
  WalletManagementStateStatus,
} from 'features/web3OnBoard/wallet-state/wallet-management-state'
import {
  WalletStateEvent,
  WalletStateEventType,
} from 'features/web3OnBoard/wallet-state/wallet-state-event'
import { canTransitWithNetworkHexId } from 'features/web3OnBoard/wallet-state/wallet-state-guards'
import { match, P } from 'ts-pattern'

export const unsupportedNetworkWalletStateReducer: Reducer<
  WalletManagementState,
  WalletStateEvent
> = (state, event) => {
  ensureCorrectState(state, WalletManagementStateStatus.unsupportedNetwork)

  return match<WalletStateEvent, WalletManagementState>(event)
    .with(
      {
        type: WalletStateEventType.changeChain,
        desiredNetworkHexId: P.when((hexId) => canTransitWithNetworkHexId(hexId, state)),
      },
      (event) => {
        return {
          ...state,
          status: WalletManagementStateStatus.settingChain,
          desiredNetworkHexId: event.desiredNetworkHexId,
        }
      },
    )
    .with(
      {
        type: WalletStateEventType.walletNetworkChanged,
        networkHexId: P.when((hexId) => canTransitWithNetworkHexId(hexId, state)),
      },
      (event) => {
        return {
          ...state,
          status: WalletManagementStateStatus.connecting,
          walletNetworkHexId: event.networkHexId,
          desiredNetworkHexId: event.networkHexId,
        }
      },
    )
    .with({ type: WalletStateEventType.disconnect }, () => {
      return {
        ...state,
        status: WalletManagementStateStatus.disconnecting,
      }
    })
    .otherwise(() => state)
}
