import { usePrevious } from '@react-hooks-library/core'
import { ConnectorEvent } from '@web3-react/types'
import {
  forksByParentHexId,
  NetworkConfigHexId,
  NetworkHexIds,
  NetworkIds,
  networkSetByHexId,
} from 'blockchain/networks'
import { useModalContext } from 'helpers/modalHook'
import { WithChildren } from 'helpers/types'
import { useReducto } from 'helpers/useReducto'
import { useRouter } from 'next/router'
import React, { createContext, useCallback, useContext, useEffect } from 'react'

import { UnsupportedNetworkModal } from './unsupported-network-modal'
import { useBridgeConnector } from './use-bridge-connector'
import { useChainSetter } from './use-chain-setter'
import { useNetworkConnector } from './use-network-connector'
import { WalletManagementState, WalletStateEvent, walletStateReducer } from './wallet-state'
import { ensureCorrectState } from './wallet-state/ensure-correct-state'
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
    status: WalletManagementStateStatus.disconnected,
    networkConnectorNetworkId: NetworkIds.MAINNET,
  },
})

export function shouldSendChangeNetworkOnConnected(
  desiredNetworkHexId: NetworkConfigHexId,
  state: WalletManagementState,
  couldBeConnectedToTestNet: boolean,
) {
  ensureCorrectState(state, WalletManagementStateStatus.connected)
  if (desiredNetworkHexId === undefined) {
    return false
  }

  if (state.pageNetworkHexIds) {
    return !state.pageNetworkHexIds.includes(desiredNetworkHexId)
  }

  const desiredNetworkConfig = networkSetByHexId[desiredNetworkHexId]

  const possibleNetworkHexIds = [desiredNetworkConfig.mainnetHexId]
  if (couldBeConnectedToTestNet) {
    possibleNetworkHexIds.push(desiredNetworkConfig.testnetHexId)
  }

  return !possibleNetworkHexIds.includes(state.walletNetworkHexId)
}

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
          if (
            state.status === WalletManagementStateStatus.connected &&
            desiredNetworkHexId &&
            state.walletNetworkHexId !== desiredNetworkHexId &&
            shouldSendChangeNetworkOnConnected(
              desiredNetworkHexId,
              state,
              couldBeConnectedToTestNet,
            )
          ) {
            dispatch({ type: WalletStateEventType.changeChain, desiredNetworkHexId })
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
