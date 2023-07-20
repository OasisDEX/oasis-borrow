import { NetworkConnector } from '@web3-react/network-connector'
import {
  NetworkConfig,
  NetworkConfigHexId,
  NetworkHexIds,
  networkSetById,
} from 'blockchain/networks'
import { useModalContext } from 'helpers/modalHook'
import { WithChildren } from 'helpers/types'
import { useReducto } from 'helpers/useReducto'
import React, { createContext, useContext, useEffect } from 'react'

import { BridgeConnector } from './bridge-connector'
import { UnsupportedNetworkModal } from './unsupported-network-modal'
import { useBridgeConnector } from './use-bridge-connector'
import { useChainSetter } from './use-chain-setter'
import { useNetworkConnector } from './use-network-connector'
import { WalletManagementState, WalletStateEvent, walletStateReducer } from './wallet-state'

export type Web3OnBoardConnectorContext = {
  connect: (desiredNetworkHexId?: NetworkConfigHexId) => void
  connector: BridgeConnector | undefined
  networkConnector: NetworkConnector
  connectedAddress: string | undefined
  connecting: boolean
  /**
   * @deprecated for now we use the chainId from the networkConnector
   */
  networkConfig: NetworkConfig | undefined
  /**
   * @deprecated for now we use the chainId from the networkConnector
   */
  setPageChainId: React.Dispatch<NetworkConfigHexId | undefined>

  setChain: (chainId: NetworkConfigHexId) => void
}

const web3OnBoardConnectorContext = createContext<Web3OnBoardConnectorContext>({
  connect: () => Promise.resolve(undefined),
  connector: undefined,
  networkConnector: new NetworkConnector({
    urls: {
      1: networkSetById[1].rpcUrl,
    },
    defaultChainId: 1,
  }),
  connectedAddress: undefined,
  connecting: false,
  networkConfig: undefined,
  setPageChainId: () => undefined,
  setChain: () => undefined,
})

export const useWeb3OnBoardConnectorContext = () => useContext(web3OnBoardConnectorContext)

function InternalProvider({ children }: WithChildren) {
  const { dispatch, state } = useReducto<WalletManagementState, WalletStateEvent>({
    defaults: {
      status: 'disconnected',
    },
    reducer: walletStateReducer,
  })
  const {
    connecting,
    createConnector,
    connector: bridgeConnector,
    disconnect,
  } = useBridgeConnector()
  const { networkConnector } = useNetworkConnector()
  // const [account, setAccount] = useState<string | undefined>(undefined)

  useEffect(() => {
    console.log(`Current state: ${state.status}`)
  }, [state])

  const { openModal, closeModal } = useModalContext()
  const { setChain, connectedChain } = useChainSetter()

  useEffect(() => {
    if (state.status === 'connecting') {
      if (bridgeConnector) dispatch({ type: 'connected', connector: bridgeConnector })
      else void createConnector()
    }
  }, [state.status, createConnector, bridgeConnector, dispatch])

  useEffect(() => {
    if (state.status === 'setting-chain') {
      void setChain(
        state.nextNetworkHexId,
        () => dispatch({ type: 'connect' }),
        () => dispatch({ ...state, type: 'change-wallet-rejected' }),
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
          const networkIdToSet = state.previousNetworkHexId ?? NetworkHexIds.MAINNET
          dispatch({ type: 'change-chain', networkHexId: networkIdToSet })
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
        connect: (desiredNetworkHexId?: NetworkConfigHexId) =>
          dispatch({ type: 'connect', desiredNetworkHexId }),
        networkConnector: networkConnector,
        connector: bridgeConnector,
        connectedAddress: bridgeConnector?.connectedAccount,
        connecting,
        networkConfig: undefined,
        setPageChainId: () => undefined,
        setChain: (chainId: NetworkConfigHexId) =>
          dispatch({ type: 'change-chain', networkHexId: chainId }),
      }}
    >
      {children}
    </web3OnBoardConnectorContext.Provider>
  )
}

export function Web3OnBoardConnectorProvider({ children }: WithChildren) {
  return <InternalProvider>{children}</InternalProvider>
}
