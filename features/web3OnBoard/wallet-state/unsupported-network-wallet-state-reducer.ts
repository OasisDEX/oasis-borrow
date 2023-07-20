import { isNetworkHexIdSupported } from 'blockchain/networks'
import { Reducer } from 'react'
import { match, P } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import { WalletManagementState } from './wallet-management-state'
import { WalletStateEvent } from './wallet-state-event'

export const unsupportedNetworkWalletStateReducer: Reducer<
  WalletManagementState,
  WalletStateEvent
> = (state, event) => {
  ensureCorrectState(state, 'unsupported-network')

  return match<WalletStateEvent, WalletManagementState>(event)
    .with({ type: 'change-chain' }, (event) => {
      return {
        status: 'setting-chain',
        currentNetworkHexId: state.networkHexId,
        nextNetworkHexId: state.desiredNetworkHexId ?? event.networkHexId,
        desiredNetworkHexId: state.desiredNetworkHexId,
      }
    })
    .with(
      {
        type: 'wallet-network-changed',
        networkHexId: P.when(
          (hexId) =>
            isNetworkHexIdSupported(hexId) &&
            [hexId, undefined].includes(state.desiredNetworkHexId),
        ),
      },
      (event) => {
        return {
          status: 'connecting',
          desiredNetworkHexId: event.networkHexId,
        }
      },
    )
    .with({ type: 'disconnect' }, () => {
      return {
        status: 'disconnecting',
      }
    })
    .otherwise(() => state)
}
