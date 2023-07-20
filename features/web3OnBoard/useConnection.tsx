import { useConnectWallet } from '@web3-onboard/react'
import { NetworkConnector } from '@web3-react/network-connector'
import { NetworkConfigHexId } from 'blockchain/networks'
import { useEffect } from 'react'

import { BridgeConnector } from './bridge-connector'
import { useWeb3OnBoardConnectorContext } from './web3-on-board-connector-provider'

export interface ConnectionState {
  connect: (chainId?: NetworkConfigHexId) => void
  connecting: boolean
  connectedChain: NetworkConfigHexId | undefined
  connectedAddress: string | undefined
  connectors: {
    network: NetworkConnector
    bridgeConnector: BridgeConnector | undefined
  }
  setChain: (chainId: NetworkConfigHexId) => void
}

export interface ConnectionProps {
  requireConnection: boolean
  chainId?: NetworkConfigHexId
}

export function useConnection({ requireConnection, chainId }: ConnectionProps): ConnectionState {
  const { connect, networkConnector, connectedAddress, connector, connecting, setChain } =
    useWeb3OnBoardConnectorContext()

  // const [onConnectHandler, setOnConnectHandler] = useState<
  //   ((info: ConnectorInformation) => void) | undefined
  // >(undefined)

  useEffect(() => {
    if (requireConnection) {
      void connect(chainId)
    }
  }, [requireConnection, connect, chainId])

  // useEffect(() => {
  //   if (connector && onConnectHandler) {
  //     onConnectHandler(connector.connectorInformation)
  //   }
  // }, [connector, onConnectHandler])

  return {
    connect: (_chainId?: NetworkConfigHexId) => connect(_chainId ?? chainId),
    connecting,
    connectedAddress,
    connectedChain: connector?.hexChainId,
    connectors: {
      network: networkConnector,
      bridgeConnector: connector,
    },
    setChain,
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
