import { isNetworkHexIdSupported } from 'blockchain/networks'
import { Reducer } from 'react'
import { match, P } from 'ts-pattern'

import { ensureCorrectState } from './ensure-correct-state'
import { WalletManagementState } from './wallet-management-state'
import { WalletStateEvent } from './wallet-state-event'

export const settingChainWalletStateReducer: Reducer<WalletManagementState, WalletStateEvent> = (
  state,
  event,
) => {
  ensureCorrectState(state, 'setting-chain')

  return match<WalletStateEvent, WalletManagementState>(event)
    .with(
      {
        type: 'change-wallet-rejected',
        currentNetworkHexId: P.when(
          (hexId) => state.desiredNetworkHexId && state.desiredNetworkHexId !== hexId,
        ),
      },
      () => {
        return {
          status: 'unsupported-network',
          previousNetworkHexId: state.desiredNetworkHexId,
          networkHexId: state.currentNetworkHexId,
          desiredNetworkHexId: state.desiredNetworkHexId,
        }
      },
    )
    .with(
      {
        type: 'change-wallet-rejected',
        currentNetworkHexId: P.when((hexId) => isNetworkHexIdSupported(hexId)),
      },
      (event) => {
        return {
          status: 'connecting',
          desiredNetworkHexId: state.desiredNetworkHexId ?? event.nextNetworkHexId,
        }
      },
    )
    .with({ type: 'change-wallet-rejected' }, (event) => {
      return {
        status: 'unsupported-network',
        previousNetworkHexId: event.nextNetworkHexId,
        networkHexId: event.currentNetworkHexId,
      }
    })
    .with(
      {
        type: 'wallet-network-changed',
        networkHexId: P.when(
          (hexId) => state.desiredNetworkHexId && state.desiredNetworkHexId !== hexId,
        ),
      },
      (event) => {
        return {
          status: 'unsupported-network',
          previousNetworkHexId: state.desiredNetworkHexId,
          networkHexId: event.networkHexId,
        }
      },
    )
    .with({ type: 'wallet-network-changed' }, (event) => {
      return {
        status: 'connecting',
        desiredNetworkHexId: event.networkHexId,
      }
    })
    .otherwise(() => state)
}
