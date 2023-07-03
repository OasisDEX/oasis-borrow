import { useSetChain } from '@web3-onboard/react'
import { NetworkConnector } from '@web3-react/network-connector'
import { NetworkConfig, NetworkConfigHexId, networkSetById } from 'blockchain/networks'
import { useModal } from 'helpers/modalHook'
import { WithChildren } from 'helpers/types'
import { useReducto } from 'helpers/useReducto'
import React, { createContext, useContext, useEffect } from 'react'

import { BridgeConnector } from './bridge-connector'
import { UnsupportedNetworkModal } from './unsupported-network-modal'
import { useBridgeConnector } from './use-bridge-connector'
import { useNetworkConnector } from './use-network-connector'
import { WalletManagementState, WalletStateAction, walletStateReducer } from './wallet-state'

export type Web3OnBoardConnectorContext = {
  connect: (networkId?: NetworkConfigHexId, forced?: boolean) => Promise<void>
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
  const { dispatch, state, updateState } = useReducto<WalletManagementState, WalletStateAction>({
    defaults: {
      type: 'disconnected',
    },
    reducer: walletStateReducer,
  })
  const { connecting, createConnector, connector: bridgeConnector } = useBridgeConnector()
  const { networkConnector } = useNetworkConnector()
  // const [account, setAccount] = useState<string | undefined>(undefined)

  const openModal = useModal()
  const [{ connectedChain }, setChain] = useSetChain()
  // const { pageChainsId, setNetworkHexId } = useChainSetter()

  // useEffect(() => {
  //   if (
  //     pageChainsId &&
  //     pageChainsId.length > 0 &&
  //     !connecting &&
  //     bridgeConnector &&
  //     !pageChainsId.includes(bridgeConnector.hexChainId)
  //   ) {
  //     void createConnector()
  //   }
  // }, [pageChainsId, bridgeConnector, connecting, createConnector, setNetworkHexId])

  useEffect(() => {
    if (state.type === 'connecting') {
      if (bridgeConnector) dispatch({ type: 'CONNECTED', connector: bridgeConnector })
      else void createConnector()
    }
  }, [state.type, createConnector, bridgeConnector, dispatch])

  useEffect(() => {
    if (state.type === 'setting-chain') {
      if (bridgeConnector) {
        void setChain({ chainId: state.networkHexId })
      }
    }
  })

  useEffect(() => {
    const id = connectedChain?.id
    if (id && id !== '0x1') {
      openModal(UnsupportedNetworkModal, {})
    }
  }, [connectedChain?.id])

  return (
    <web3OnBoardConnectorContext.Provider
      value={{
        connect: (_networkId?: NetworkConfigHexId, _forced?: boolean) => {
          return createConnector()
        },
        networkConnector: networkConnector,
        connector: bridgeConnector,
        connectedAddress: bridgeConnector?.connectedAccount,
        connecting,
        networkConfig: undefined,
        setPageChainId: () => undefined,
        setChain: (chainId: NetworkConfigHexId) =>
          dispatch({ type: 'CHANGE_CHAIN', networkHexId: chainId }),
      }}
    >
      {children}
    </web3OnBoardConnectorContext.Provider>
  )
}

export function Web3OnBoardConnectorProvider({ children }: WithChildren) {
  return <InternalProvider>{children}</InternalProvider>
}
