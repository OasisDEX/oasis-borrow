import { ConnectorEvent } from '@web3-react/types'
import {
  forksByParentHexId,
  NetworkConfigHexId,
  NetworkIds,
  networkSetByHexId,
} from 'blockchain/networks'
import { useModalContext } from 'helpers/modalHook'
import { WithChildren } from 'helpers/types'
import { useReducto } from 'helpers/useReducto'
import React, { createContext, useCallback, useContext, useEffect } from 'react'

import { UnsupportedNetworkModal } from './unsupported-network-modal'
import { useBridgeConnector } from './use-bridge-connector'
import { useChainSetter } from './use-chain-setter'
import { useNetworkConnector } from './use-network-connector'
import { WalletManagementState, WalletStateEvent, walletStateReducer } from './wallet-state'
import { useDebugWalletState } from './wallet-state/use-debug-wallet-state'
import { areThePageNetworksTheSame } from './wallet-state/wallet-management-state'

export type Web3OnBoardConnectorContext = {
  connect: (desiredNetworkHexId?: NetworkConfigHexId) => void
  disconnect: () => void
  connecting: boolean
  setChain: (desiredNetworkHexId: NetworkConfigHexId) => void
  setPageNetworks: (
    networkHexIds: NetworkConfigHexId[] | undefined,
    includeTestNet?: boolean,
  ) => void
  state: WalletManagementState
}

function getNetworksFromPageNetwork(
  networkHexIds: NetworkConfigHexId[] | undefined,
  includeTestNet: boolean,
): NetworkConfigHexId[] | undefined {
  if (networkHexIds === undefined) return undefined

  const hexSet = new Set<NetworkConfigHexId | undefined>()

  networkHexIds.forEach((networkHexId) => {
    const networkConfig = networkSetByHexId[networkHexId]

    hexSet.add(networkConfig.mainnetHexId)
    if (includeTestNet) hexSet.add(networkConfig.testnetHexId)

    const parentNetwork = networkConfig.getParentNetwork()

    if (parentNetwork) {
      hexSet.add(parentNetwork.hexId)
      hexSet.add(parentNetwork.mainnetHexId)
      if (includeTestNet) hexSet.add(parentNetwork.testnetHexId)
    }

    const forkConfig = forksByParentHexId[networkHexId]

    if (forkConfig) {
      hexSet.add(forkConfig.hexId)
    }
  })

  return Array.from(hexSet).filter((hexId): hexId is NetworkConfigHexId => hexId !== undefined)
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
  state: {
    status: 'disconnected',
  },
})

export const useWeb3OnBoardConnectorContext = () => useContext(web3OnBoardConnectorContext)

function InternalProvider({ children }: WithChildren) {
  const { networkConnector } = useNetworkConnector()
  const { dispatch, state } = useReducto<WalletManagementState, WalletStateEvent>({
    defaults: {
      status: 'disconnected',
      networkConnector,
      networkConnectorNetworkId: NetworkIds.MAINNET,
    },
    reducer: walletStateReducer,
  })
  const { createConnector, connector: bridgeConnector, disconnect } = useBridgeConnector()

  useDebugWalletState({ state })

  const { openModal, closeModal } = useModalContext()
  const { setChain, connectedChain } = useChainSetter()

  useEffect(() => {
    if (
      bridgeConnector &&
      state.status === 'connected' &&
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
    if (state.status === 'connecting') {
      if (bridgeConnector) dispatch({ type: 'connected', connector: bridgeConnector })
      else void createConnector()
    }
  }, [state.status, createConnector, bridgeConnector, dispatch])

  useEffect(() => {
    if (state.status === 'disconnected' && bridgeConnector) {
      dispatch({ type: 'connect', desiredNetworkHexId: bridgeConnector.hexChainId })
    }
  })

  useEffect(() => {
    if (
      state.status === 'setting-chain' &&
      state.desiredNetworkHexId !== state.walletNetworkHexId
    ) {
      void setChain(
        state.desiredNetworkHexId,
        () => dispatch({ type: 'wallet-network-changed', networkHexId: state.desiredNetworkHexId }),
        () =>
          dispatch({
            type: 'change-wallet-rejected',
            walletNetworkHexId: state.walletNetworkHexId,
            desiredNetworkHexId: state.desiredNetworkHexId,
          }),
      )
    }
  }, [state, setChain, dispatch])

  useEffect(() => {
    if (connectedChain?.id) {
      dispatch({
        type: 'wallet-network-changed',
        networkHexId: connectedChain.id as NetworkConfigHexId,
      })
    }
  }, [connectedChain?.id, dispatch])

  useEffect(() => {
    if (state.status === 'unsupported-network') {
      openModal(UnsupportedNetworkModal, {
        switchNetwork: async () => {
          dispatch({ type: 'change-chain', desiredNetworkHexId: state.desiredNetworkHexId })
        },
      })
    } else if (state.status === 'connected') {
      closeModal()
    }
  }, [state, dispatch])

  useEffect(() => {
    if (state.status === 'disconnecting') {
      void disconnect().then(() => {
        dispatch({ type: 'disconnected' })
      })
    }
  }, [state, disconnect, dispatch])

  return (
    <web3OnBoardConnectorContext.Provider
      value={{
        connect: (desiredNetworkHexId?: NetworkConfigHexId) => {
          if (
            state.status === 'connected' &&
            desiredNetworkHexId &&
            state.walletNetworkHexId !== desiredNetworkHexId
          ) {
            dispatch({ type: 'change-chain', desiredNetworkHexId })
          } else {
            dispatch({ type: 'connect', desiredNetworkHexId })
          }
        },
        disconnect: () => dispatch({ type: 'disconnect' }),
        connecting: state.status === 'connecting',
        setChain: (chainId: NetworkConfigHexId) =>
          dispatch({ type: 'change-chain', desiredNetworkHexId: chainId }),
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
