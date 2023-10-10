import type { Reducer } from 'react'
import { match, P } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import type { WalletManagementState } from './wallet-management-state'
import { getDesiredNetworkHexId, WalletManagementStateStatus } from './wallet-management-state'
import type { WalletStateEvent } from './wallet-state-event'
import { WalletStateEventType } from './wallet-state-event'
import { canTransitWithNetworkHexId } from './wallet-state-guards'

export const settingChainWalletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state,
  event,
) => {
  ensureCorrectState(state, WalletManagementStateStatus.settingChain)

  return match<WalletStateEvent, WalletManagementState>(event)
    .with(
      {
        type: WalletStateEventType.changeWalletRejected,
        walletNetworkHexId: P.when((hexId) => !canTransitWithNetworkHexId(hexId, state)),
      },
      () => {
        return {
          ...state,
          status: WalletManagementStateStatus.unsupportedNetwork,
          desiredNetworkHexId: getDesiredNetworkHexId(state),
        }
      },
    )
    .with(
      {
        type: WalletStateEventType.changeWalletRejected,
      },
      (event) => {
        return {
          ...state,
          status: WalletManagementStateStatus.connecting,
          desiredNetworkHexId: event.walletNetworkHexId,
        }
      },
    )
    .with(
      {
        type: WalletStateEventType.walletNetworkChanged,
        networkHexId: P.when((hexId) => !canTransitWithNetworkHexId(hexId, state)),
      },
      (event) => {
        return {
          ...state,
          status: WalletManagementStateStatus.unsupportedNetwork,
          walletNetworkHexId: event.networkHexId,
          desiredNetworkHexId: getDesiredNetworkHexId(state),
        }
      },
    )
    .with({ type: WalletStateEventType.walletNetworkChanged }, (event) => {
      return {
        ...state,
        status: WalletManagementStateStatus.connecting,
        walletNetworkHexId: event.networkHexId,
        desiredNetworkHexId: event.networkHexId,
      }
    })
    .otherwise(() => state)
}
