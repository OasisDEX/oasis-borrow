import { Reducer } from 'react'
import { match, P } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import {
  getDesiredNetworkHexId,
  WalletManagementState,
  WalletManagementStateStatus,
} from './wallet-management-state'
import { WalletStateEvent, WalletStateEventType } from './wallet-state-event'
import { canTransitWithNetworkHexId } from './wallet-state-guards'

export const connectedWalletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state: WalletManagementState,
  event: WalletStateEvent,
) => {
  ensureCorrectState(state, WalletManagementStateStatus.connected)

  return match<WalletStateEvent, WalletManagementState>(event)
    .with({ type: WalletStateEventType.disconnect }, () => {
      return {
        ...state,
        status: WalletManagementStateStatus.disconnecting,
      }
    })
    .with(
      {
        type: WalletStateEventType.changeChain,
        desiredNetworkHexId: P.when((hexId) => hexId !== state.walletNetworkHexId),
      },
      (event) => {
        return {
          ...state,
          desiredNetworkHexId: event.desiredNetworkHexId,
          status: WalletManagementStateStatus.settingChain,
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
          walletNetworkHexId: event.networkHexId,
          desiredNetworkHexId: getDesiredNetworkHexId(state),
          status: WalletManagementStateStatus.unsupportedNetwork,
        }
      },
    )
    .with(
      {
        type: WalletStateEventType.walletNetworkChanged,
        networkHexId: P.when((hexId) => state.connector.hexChainId !== hexId),
      },
      (event) => {
        return {
          ...state,
          status: WalletManagementStateStatus.connecting,
          desiredNetworkHexId: event.networkHexId,
        }
      },
    )
    .otherwise(() => state)
}
