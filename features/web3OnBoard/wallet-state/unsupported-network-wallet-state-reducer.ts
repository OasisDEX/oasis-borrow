import { Reducer } from 'react'
import { match, P } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import { WalletManagementState } from './wallet-management-state'
import { WalletStateEvent } from './wallet-state-event'
import { canTransitWithNetworkHexId } from './wallet-state-guards'

export const unsupportedNetworkWalletStateReducer: Reducer<
  WalletManagementState,
  WalletStateEvent
> = (state, event) => {
  ensureCorrectState(state, 'unsupported-network')

  return match<WalletStateEvent, WalletManagementState>(event)
    .with(
      {
        type: 'change-chain',
        desiredNetworkHexId: P.when((hexId) => canTransitWithNetworkHexId(hexId, state)),
      },
      (event) => {
        return {
          ...state,
          status: 'setting-chain',
          desiredNetworkHexId: event.desiredNetworkHexId,
        }
      },
    )
    .with(
      {
        type: 'wallet-network-changed',
        networkHexId: P.when((hexId) => canTransitWithNetworkHexId(hexId, state)),
      },
      (event) => {
        return {
          ...state,
          status: 'connecting',
          walletNetworkHexId: event.networkHexId,
          desiredNetworkHexId: event.networkHexId,
        }
      },
    )
    .with({ type: 'disconnect' }, () => {
      return {
        ...state,
        status: 'disconnecting',
      }
    })
    .otherwise(() => state)
}
