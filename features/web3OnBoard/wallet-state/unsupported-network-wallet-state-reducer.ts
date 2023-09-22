import type { Reducer } from 'react'
import { match, P } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import type { WalletManagementState } from './wallet-management-state'
import { WalletManagementStateStatus } from './wallet-management-state'
import type { WalletStateEvent } from './wallet-state-event'
import { WalletStateEventType } from './wallet-state-event'
import { canTransitWithNetworkHexId } from './wallet-state-guards'

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
