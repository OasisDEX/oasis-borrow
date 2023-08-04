import { usePrevious } from '@react-hooks-library/core'
import { ConnectorEvent } from '@web3-react/types'
import { NetworkConfigHexId, NetworkHexIds, NetworkIds } from 'blockchain/networks'
import { useModalContext } from 'helpers/modalHook'
import { WithChildren } from 'helpers/types'
import { useReducto } from 'helpers/useReducto'
import { useRouter } from 'next/router'
import React, { createContext, useCallback, useContext, useEffect } from 'react'

import { getNetworksFromPageNetwork } from './get-networks-from-page-network'
import { UnsupportedNetworkModal } from './unsupported-network-modal'
import { useBridgeConnector } from './use-bridge-connector'
import { useChainSetter } from './use-chain-setter'
import { useNetworkConnector } from './use-network-connector'
import { WalletManagementState, WalletStateEvent, walletStateReducer } from './wallet-state'
import { useDebugWalletState } from './wallet-state/use-debug-wallet-state'
import {
  areThePageNetworksTheSame,
  WalletManagementStateStatus,
} from './wallet-state/wallet-management-state'
import { WalletStateEventType } from './wallet-state/wallet-state-event'

export type Web3OnBoardConnectorContext = {
  connect: (desiredNetworkHexId?: NetworkConfigHexId, couldBeConnectedToTestNet?: boolean) => void
  disconnect: () => void
  connecting: boolean
  setChain: (desiredNetworkHexId: NetworkConfigHexId) => void
  toggleBetweenMainnetAndTestnet: () => void
  setPageNetworks: (
    networkHexIds: NetworkConfigHexId[] | undefined,
    includeTestNet?: boolean,
  ) => void
  state: WalletManagementState
}

const web3OnBoardConnectorContext = createContext<Web3OnBoardConnectorContext>({
  connect: () => {
    console.warn('Web3OnBoardConnectorContext not initialized')
  },
  disconnect: () => {
    console.warn('Web3OnBoardConnectorContext not initialized')
  },
  connecting: false,
  setChain: () => {
    console.warn('Web3OnBoardConnectorContext not initialized')
  },
  setPageNetworks: () => {
    console.warn('Web3OnBoardConnectorContext not initialized')
  },
  toggleBetweenMainnetAndTestnet: () => {
    console.warn('Web3OnBoardConnectorContext not initialized')
  },
  state: {
    status: WalletManagementStateStatus.disconnected,
    networkConnectorNetworkId: NetworkIds.MAINNET,
  },
})

/*
 * I don't like this solution,
 * but it's the only way I found to make it work.
 * The problem is that some components strictly depend on Mainnet or Goerli,
 * so the only way to refresh them is to reload the page.
 */
export function useSafaftyReload({ walletNetworkHexId }: WalletManagementState) {
  const previuosWalletNetworkHexId = usePrevious(walletNetworkHexId)
  const { reload } = useRouter()

  useEffect(() => {
    if (
      walletNetworkHexId === NetworkHexIds.MAINNET &&
      previuosWalletNetworkHexId === NetworkHexIds.GOERLI
    ) {
      reload()
    }
    if (
      walletNetworkHexId === NetworkHexIds.GOERLI &&
      previuosWalletNetworkHexId === NetworkHexIds.MAINNET
    ) {
      reload()
    }
  }, [reload, previuosWalletNetworkHexId, walletNetworkHexId])
}

export const useWeb3OnBoardConnectorContext = () => useContext(web3OnBoardConnectorContext)

function InternalProvider({ children }: WithChildren) {
  const { networkConnector } = useNetworkConnector()
  const { dispatch, state } = useReducto<WalletManagementState, WalletStateEvent>({
    defaults: {
      status: WalletManagementStateStatus.disconnected,
      networkConnector,
      networkConnectorNetworkId: NetworkIds.MAINNET,
    },
    reducer: walletStateReducer,
  })
  const {
    createConnector,
    connector: bridgeConnector,
    disconnect,
    connecting,
  } = useBridgeConnector()

  useDebugWalletState({ state })
  useSafaftyReload(state)

  const { openModal, closeModal } = useModalContext()
  const { setChain, connectedChain } = useChainSetter()

  useEffect(() => {
    if (
      bridgeConnector &&
      state.status === WalletManagementStateStatus.connected &&
      bridgeConnector.chainId !== state.networkConnectorNetworkId
    ) {
      networkConnector?.changeChainId(bridgeConnector.chainId)
    }
  }, [bridgeConnector, state, dispatch, networkConnector])

  const handleChainChanged = useCallback(
    ({ chainId }: { chainId: number }) => {
      if (chainId !== state.networkConnectorNetworkId) {
        dispatch({ type: 'partial-update', state: { networkConnectorNetworkId: chainId } })
      }
    },
    [state.networkConnectorNetworkId, dispatch],
  )

  useEffect(() => {
    networkConnector.on(ConnectorEvent.Update, handleChainChanged)
    return () => {
      networkConnector.off(ConnectorEvent.Update, handleChainChanged)
    }
  }, [networkConnector, handleChainChanged])

  useEffect(() => {
    if (state.status === WalletManagementStateStatus.connecting) {
      if (bridgeConnector)
        dispatch({ type: WalletStateEventType.connected, connector: bridgeConnector })
      else {
        if (!connecting) {
          createConnector()
            .then((result) => {
              if (!result) dispatch({ type: WalletStateEventType.connectionCancelled })
            })
            .catch((error) => {
              console.error(error)
              dispatch({ type: WalletStateEventType.connectionCancelled })
            })
        }
      }
    }
  }, [state.status, createConnector, bridgeConnector, dispatch, connecting])

  useEffect(() => {
    if (state.status === WalletManagementStateStatus.disconnected && bridgeConnector) {
      dispatch({
        type: WalletStateEventType.connect,
        desiredNetworkHexId: bridgeConnector.hexChainId,
      })
    }
  })

  useEffect(() => {
    if (
      state.status === WalletManagementStateStatus.settingChain &&
      state.desiredNetworkHexId !== state.walletNetworkHexId
    ) {
      void setChain(
        state.desiredNetworkHexId,
        () =>
          dispatch({
            type: WalletStateEventType.walletNetworkChanged,
            networkHexId: state.desiredNetworkHexId,
          }),
        () =>
          dispatch({
            type: WalletStateEventType.changeWalletRejected,
            walletNetworkHexId: state.walletNetworkHexId,
            desiredNetworkHexId: state.desiredNetworkHexId,
          }),
      )
    }
  }, [state, setChain, dispatch])

  useEffect(() => {
    if (connectedChain?.id) {
      dispatch({
        type: WalletStateEventType.walletNetworkChanged,
        networkHexId: connectedChain.id as NetworkConfigHexId,
      })
    }
  }, [connectedChain?.id, dispatch])

  useEffect(() => {
    if (state.status === WalletManagementStateStatus.unsupportedNetwork) {
      openModal(UnsupportedNetworkModal, {
        switchNetwork: async () => {
          dispatch({
            type: WalletStateEventType.changeChain,
            desiredNetworkHexId: state.desiredNetworkHexId,
          })
        },
      })
    } else if (state.status === WalletManagementStateStatus.connected) {
      closeModal()
    }
  }, [state, dispatch])

  useEffect(() => {
    if (state.status === WalletManagementStateStatus.disconnecting) {
      void disconnect().then(() => {
        dispatch({ type: WalletStateEventType.disconnected })
      })
    }
  }, [state, disconnect, dispatch])

  return (
    <web3OnBoardConnectorContext.Provider
      value={{
        connect: (
          desiredNetworkHexId?: NetworkConfigHexId,
          couldBeConnectedToTestNet: boolean = false,
        ) => {
          if (state.status === WalletManagementStateStatus.connected && desiredNetworkHexId) {
            dispatch({
              type: WalletStateEventType.changeChain,
              desiredNetworkHexId,
              couldBeConnectedToTestNet,
            })
          } else {
            dispatch({ type: WalletStateEventType.connect, desiredNetworkHexId })
          }
        },
        disconnect: () => dispatch({ type: WalletStateEventType.disconnect }),
        connecting: state.status === WalletManagementStateStatus.connecting,
        setChain: (chainId: NetworkConfigHexId) =>
          dispatch({ type: WalletStateEventType.changeChain, desiredNetworkHexId: chainId }),
        setPageNetworks: (networkHexIds, includeTestNet = false) => {
          const networksToSet: NetworkConfigHexId[] | undefined = getNetworksFromPageNetwork(
            networkHexIds,
            includeTestNet,
          )

          if (areThePageNetworksTheSame(networksToSet, state)) return

          dispatch({
            type: 'partial-update',
            state: {
              pageNetworkHexIds: networksToSet,
            },
          })
        },
        toggleBetweenMainnetAndTestnet: () => {
          dispatch({ type: WalletStateEventType.toggleBetweenMainnetAndTestnet })
        },
        state,
      }}
    >
      {children}
    </web3OnBoardConnectorContext.Provider>
  )
}

export function Web3OnBoardConnectorProvider({ children }: WithChildren) {
  return <InternalProvider>{children}</InternalProvider>
}
