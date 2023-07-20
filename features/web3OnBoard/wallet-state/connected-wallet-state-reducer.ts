import { isNetworkHexIdSupported } from 'blockchain/networks'
import { Reducer } from 'react'
import { match, P } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import { WalletManagementState } from './wallet-management-state'
import { WalletStateEvent } from './wallet-state-event'

export const connectedWalletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state: WalletManagementState,
  event: WalletStateEvent,
) => {
  ensureCorrectState(state, 'connected')

  return match<WalletStateEvent, WalletManagementState>(event)
    .with({ type: 'connect' }, () => {
      return state
    })
    .with({ type: 'connected' }, () => {
      return state
    })
    .with({ type: 'disconnect' }, () => {
      return {
        status: 'disconnecting',
      }
    })
    .with({ type: 'change-chain' }, (event) => {
      return {
        status: 'setting-chain',
        currentNetworkHexId: state.networkHexId,
        nextNetworkHexId: event.networkHexId,
      }
    })
    .with(
      {
        type: 'wallet-network-changed',
        networkHexId: P.when(
          (hexId) =>
            !isNetworkHexIdSupported(hexId) ||
            ![hexId, undefined].includes(state.desiredNetworkHexId),
        ),
      },
      (event) => {
        return {
          status: 'unsupported-network',
          previousNetworkHexId: state.networkHexId,
          networkHexId: event.networkHexId,
          desiredNetworkHexId: state.desiredNetworkHexId,
        }
      },
    )
    .with(
      {
        type: 'wallet-network-changed',
        networkHexId: P.when((hexId) => state.connector.hexChainId !== hexId),
      },
      (event) => {
        return {
          status: 'connecting',
          desiredNetworkHexId: event.networkHexId,
        }
      },
    )
    .with({ type: 'change-wallet-rejected' }, () => {
      throw new Error(`Invalid transition from ${state.status} using ${event.type}`)
    })
    .otherwise(() => state)
}
