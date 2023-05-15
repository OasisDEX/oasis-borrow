import { AbstractConnector } from '@web3-react/abstract-connector'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networkIds'
import { ethers } from 'ethers'
import Web3 from 'web3'

export type ConnectionKind = 'injected' | 'network'

export function isConnectable(
  web3Context: Web3Context | undefined,
): web3Context is ConnectableWeb3Context {
  return (
    web3Context?.status === 'notConnected' ||
    web3Context?.status === 'connectedReadonly' ||
    web3Context?.status === 'error'
  )
}

interface Connectable {
  connect: (connector: AbstractConnector, connectionKind: ConnectionKind) => Promise<boolean>
}

export interface Web3ContextNotConnected extends Connectable {
  status: 'notConnected'
}

export interface Web3ContextConnecting {
  status: 'connecting'
  connectionKind: ConnectionKind
}

export interface AccountWithBalances {
  address: string
  ethAmount: BigNumber
  daiAmount: BigNumber
}

export interface Web3ContextConnectedReadonly extends Connectable {
  status: 'connectedReadonly'
  connectionKind: ConnectionKind
  web3: Web3
  chainId: NetworkIds
  deactivate: () => void
  connectionMethod: 'legacy' | 'web3-onboard'
  walletLabel?: undefined
}

export interface Web3ContextConnected {
  status: 'connected'
  connectionKind: ConnectionKind
  web3: Web3
  transactionProvider: ethers.Signer
  chainId: NetworkIds
  deactivate: () => void
  account: string
  magicLinkEmail?: string
  connectionMethod: 'legacy' | 'web3-onboard'
  walletLabel?: string // you can check this value in our MixPanel board.
}

export interface Web3ContextError extends Connectable {
  status: 'error'
  error: Error
  deactivate: () => void
}

export type ConnectableWeb3Context =
  | Web3ContextNotConnected
  | Web3ContextConnectedReadonly
  | Web3ContextError

export type Web3Context =
  | Web3ContextNotConnected
  | Web3ContextConnecting
  | Web3ContextError
  | Web3ContextConnectedReadonly
  | Web3ContextConnected
