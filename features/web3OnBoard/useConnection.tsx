import { useConnectWallet } from '@web3-onboard/react'
import { NetworkConnector } from '@web3-react/network-connector'
import { NetworkConfigHexId } from 'blockchain/networks'
import { useEffect, useState } from 'react'

import { BridgeConnector, ConnectorInformation } from './BridgeConnector'
import { useWeb3OnBoardConnectorContext } from './web3OnBoardConnectorProvider'

export interface ConnectionState {
  connect: (
    chainId?: NetworkConfigHexId,
    options?: {
      forced?: boolean
      onConnect?: (info: ConnectorInformation) => void
    },
  ) => Promise<void>
  connecting: boolean
  connectedChain: NetworkConfigHexId | undefined
  connectedAddress: string | undefined
  connectors: {
    network: NetworkConnector
    bridgeConnector: BridgeConnector | undefined
  }
}

export interface ConnectionProps {
  pageChainId?: NetworkConfigHexId
  initialConnect: boolean
  chainId?: NetworkConfigHexId
}

export function useConnection({
  initialConnect,
  chainId,
  pageChainId,
}: ConnectionProps): ConnectionState {
  const { connect, networkConnector, connectedAddress, connector, connecting, setPageChainId } =
    useWeb3OnBoardConnectorContext()

  useEffect(() => {
    if (pageChainId) {
      setPageChainId(pageChainId)
    }
  }, [pageChainId, setPageChainId])

  const [onConnectHandler, setOnConnectHandler] = useState<
    ((info: ConnectorInformation) => void) | undefined
  >(undefined)

  useEffect(() => {
    if (initialConnect) {
      void connect(chainId)
    }
  }, [initialConnect, chainId, connect])

  useEffect(() => {
    if (connector && onConnectHandler) {
      onConnectHandler(connector.basicInfo)
    }
  }, [connector, onConnectHandler])

  return {
    connect: async (chainId, options) => {
      console.log('connect context setup', chainId, options)
      if (options?.onConnect) {
        setOnConnectHandler(options.onConnect)
      }
      await connect(chainId, options?.forced)
    },
    connecting,
    connectedAddress,
    connectedChain: connector?.hexChainId,
    connectors: {
      network: networkConnector,
      bridgeConnector: connector,
    },
  }
}

export interface Wallet {
  address: string
}

export interface WalletManagementState {
  disconnect: () => Promise<void>
  connecting: boolean
  chainHexId: NetworkConfigHexId | undefined
  wallet: Wallet | undefined
}
export function useWalletManagement(): WalletManagementState {
  const [{ wallet, connecting }, , disconnect] = useConnectWallet()
  return {
    disconnect: async () => {
      if (wallet) {
        await disconnect({ label: wallet.label })
      }
    },
    connecting,
    chainHexId: wallet?.chains[0].id as NetworkConfigHexId,
    wallet: wallet ? { address: wallet.accounts[0].address } : undefined,
  }
}
