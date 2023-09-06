import { useEffect } from 'react'
import { usePrevious } from '@react-hooks-library/core'
import { WalletManagementState } from 'features/web3OnBoard/wallet-state/wallet-management-state'

interface IDebugWalletState {
  state: WalletManagementState
}

export function useDebugWalletState({ state }: IDebugWalletState) {
  const previousState = usePrevious(state)

  const stringValue = (state: WalletManagementState | undefined) => {
    if (state === undefined) return ''

    return JSON.stringify(
      {
        walletNetwork: state.walletNetworkHexId,
        desiredNetwork: state.desiredNetworkHexId,
        networkConnector: state.networkConnectorNetworkId,
      },
      null,
      2,
    )
  }

  useEffect(() => {
    console.log(
      `Current State: ${state.status}. (${stringValue(state)}) Transition from state: ${
        previousState?.status
      }. (${stringValue(previousState)})`,
    )
  }, [state])
}
