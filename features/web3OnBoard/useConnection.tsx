import type { NetworkConfigHexId, NetworkIds } from 'blockchain/networks'
import { ethers } from 'ethers'
import { useMemo } from 'react'

import { useWeb3OnBoardConnectorContext } from './web3-on-board-connector-provider'

export interface Connection {
  connect: (chainId?: NetworkConfigHexId, couldBeConnectedToTestNet?: boolean) => void
  connecting: boolean
  setPageNetworks: (
    networkHexIds: NetworkConfigHexId[] | undefined,
    includeTestNet?: boolean,
  ) => void
  setChain: (chainId: NetworkConfigHexId) => void
  toggleBetweenMainnetAndTestnet: () => void
}

export function useConnection(): Connection {
  const { connect, connecting, setChain, setPageNetworks, toggleBetweenMainnetAndTestnet } =
    useWeb3OnBoardConnectorContext()

  return {
    connect,
    connecting,
    setChain,
    setPageNetworks,
    toggleBetweenMainnetAndTestnet,
  }
}

export interface Wallet {
  address: string
  chainHexId: NetworkConfigHexId
  chainId: NetworkIds
}

export interface WalletManagementState {
  disconnect: () => void
  connecting: boolean
  chainId: NetworkIds
  wallet: Wallet | undefined
  signer: ethers.Signer | undefined
}
export function useWalletManagement(): WalletManagementState {
  const { state, disconnect } = useWeb3OnBoardConnectorContext()
  const signer = useMemo(() => {
    return state.connector
      ? new ethers.providers.Web3Provider(state.connector.connectorInformation.provider).getSigner()
      : undefined
  }, [state.connector])
  const wallet = useMemo(() => {
    return state.connector
      ? {
          address: state.connector.connectedAccount,
          chainHexId: state.connector.hexChainId,
          chainId: state.connector.chainId,
        }
      : undefined
  }, [state.connector])
  return {
    disconnect,
    connecting: state.status === 'connecting',
    chainId: state.networkConnectorNetworkId,
    wallet: wallet,
    signer: signer,
  }
}
