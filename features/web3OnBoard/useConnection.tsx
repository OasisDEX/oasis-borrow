import { useConnectWallet } from '@web3-onboard/react'
import { NetworkConnector } from '@web3-react/network-connector'
import { NetworkConfigHexId } from 'blockchain/networks'
import { useEffect, useState } from 'react'

import { BridgeConnector, ConnectorInformation } from './BridgeConnector'
import { useWeb3OnBoardConnectorContext } from './web3OnBoardConnectorProvider'

export interface ConnectionState {
  connect: (
    chainId?: NetworkConfigHexId,
    onConnect?: (info: ConnectorInformation) => void,
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
  initialConnect: boolean
  chainId?: NetworkConfigHexId
}

export function useConnection({ initialConnect, chainId }: ConnectionProps): ConnectionState {
  const { connect, networkConnector, connectedAddress, connector, connecting } =
    useWeb3OnBoardConnectorContext()

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
    connect: async (chainId, onConnect) => {
      setOnConnectHandler(onConnect)
      await connect(chainId)
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
  chainId: NetworkConfigHexId | undefined
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
    chainId: wallet?.chains[0].id as NetworkConfigHexId,
    wallet: wallet ? { address: wallet.accounts[0].address } : undefined,
  }
}
