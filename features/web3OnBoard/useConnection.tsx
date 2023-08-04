import { NetworkConfigHexId, NetworkIds } from 'blockchain/networks'

import { useWeb3OnBoardConnectorContext } from './web3-on-board-connector-provider'

export interface Connection {
  connect: (chainId?: NetworkConfigHexId, couldBeConnectedToTestNet?: boolean) => void
  connecting: boolean
  setPageNetworks: (
    networkHexIds: NetworkConfigHexId[] | undefined,
    includeTestNet?: boolean,
  ) => void
  setChain: (chainId: NetworkConfigHexId) => void
}

export function useConnection(): Connection {
  const { connect, connecting, setChain, setPageNetworks } = useWeb3OnBoardConnectorContext()

  return {
    connect,
    connecting,
    setChain,
    setPageNetworks,
  }
}

export interface Wallet {
  address: string
  chainHexId: NetworkConfigHexId
}

export interface WalletManagementState {
  disconnect: () => void
  connecting: boolean
  chainId: NetworkIds
  wallet: Wallet | undefined
}
export function useWalletManagement(): WalletManagementState {
  const { state, disconnect } = useWeb3OnBoardConnectorContext()
  return {
    disconnect,
    connecting: state.status === 'connecting',
    chainId: state.networkConnectorNetworkId,
    wallet: state.connector
      ? { address: state.connector.connectedAccount, chainHexId: state.connector.hexChainId }
      : undefined,
  }
}
