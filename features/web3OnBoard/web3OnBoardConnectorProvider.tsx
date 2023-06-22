import { NetworkConnector } from '@web3-react/network-connector'
import {
  NetworkConfig,
  NetworkConfigHexId,
  networkSetByHexId,
  networkSetById,
} from 'blockchain/networks'
import { WithChildren } from 'helpers/types'
import React, { createContext, useContext, useEffect, useState } from 'react'

import { BridgeConnector } from './BridgeConnector'
import { useBridgeConnector } from './useBridgeConnector'
import { useNetworkConnector } from './useNetworkConnector'

export type Web3OnBoardConnectorContext = {
  connect: (networkId?: NetworkConfigHexId, forced?: boolean) => Promise<void>
  connector: BridgeConnector | undefined
  networkConnector: NetworkConnector
  connectedAddress: string | undefined
  connecting: boolean
  networkConfig: NetworkConfig | undefined
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
})

export const useWeb3OnBoardConnectorContext = () => useContext(web3OnBoardConnectorContext)

function InternalProvider({ children }: WithChildren) {
  const {
    connecting,
    createConnector,
    connectorState: [bridgeConnector],
  } = useBridgeConnector()
  const { networkConnector, networkConfig: networkConnectorNetwork } = useNetworkConnector()
  const [account, setAccount] = useState<string | undefined>(undefined)

  useEffect(() => {
    setAccount(bridgeConnector?.connectedAccount)
  }, [bridgeConnector])
  return (
    <web3OnBoardConnectorContext.Provider
      value={{
        connect: createConnector,
        networkConnector: networkConnector,
        connector: bridgeConnector,
        connectedAddress: account,
        connecting,
        networkConfig: bridgeConnector
          ? networkSetByHexId[bridgeConnector.hexChainId]
          : networkConnectorNetwork,
      }}
    >
      {children}
    </web3OnBoardConnectorContext.Provider>
  )
}

export function Web3OnBoardConnectorProvider({ children }: WithChildren) {
  return <InternalProvider>{children}</InternalProvider>
}
