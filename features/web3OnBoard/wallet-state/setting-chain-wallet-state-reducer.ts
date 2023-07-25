import { Reducer } from 'react'
import { match, P } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import { getDesiredNetworkHexId, WalletManagementState } from './wallet-management-state'
import { WalletStateEvent } from './wallet-state-event'
import { canTransitWithNetworkHexId } from './wallet-state-guards'

export const settingChainWalletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state,
  event,
) => {
  ensureCorrectState(state, 'setting-chain')

  return match<WalletStateEvent, WalletManagementState>(event)
    .with(
      {
        type: 'change-wallet-rejected',
        walletNetworkHexId: P.when((hexId) => !canTransitWithNetworkHexId(hexId, state)),
      },
      () => {
        return {
          ...state,
          status: 'unsupported-network',
          desiredNetworkHexId: getDesiredNetworkHexId(state),
        }
      },
    )
    .with(
      {
        type: 'change-wallet-rejected',
      },
      (event) => {
        return {
          ...state,
          status: 'connecting',
          desiredNetworkHexId: event.walletNetworkHexId,
        }
      },
    )
    .with(
      {
        type: 'wallet-network-changed',
        networkHexId: P.when((hexId) => !canTransitWithNetworkHexId(hexId, state)),
      },
      (event) => {
        return {
          ...state,
          status: 'unsupported-network',
          walletNetworkHexId: event.networkHexId,
          desiredNetworkHexId: getDesiredNetworkHexId(state),
        }
      },
    )
    .with({ type: 'wallet-network-changed' }, (event) => {
      return {
        ...state,
        status: 'connecting',
        walletNetworkHexId: event.networkHexId,
        desiredNetworkHexId: event.networkHexId,
      }
    })
    .otherwise(() => state)
}
