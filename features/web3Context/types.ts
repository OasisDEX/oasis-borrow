import { AbstractConnector } from '@web3-react/abstract-connector'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'

export type ConnectionKind =
  | 'injected'
  | 'walletLink'
  | 'walletConnect'
  | 'portis'
  | 'myetherwallet'
  | 'trezor'
  | 'ledger'
  | 'network'
  | 'gnosisSafe'
  | 'magicLink'

interface Connectable {
  connect: (connector: AbstractConnector, connectionKind: ConnectionKind) => Promise<void>
  connectLedger: (chainId: number, derivationPath: string) => void
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

export interface Web3ContextConnectingHWSelectAccount {
  status: 'connectingHWSelectAccount'
  connectionKind: 'ledger' | 'trezor'
  getAccounts: (accountsLength: number) => Promise<AccountWithBalances[]>
  selectAccount: (account: string) => void
  deactivate: () => void
}

export interface Web3ContextConnectedReadonly extends Connectable {
  status: 'connectedReadonly'
  connectionKind: ConnectionKind
  web3: Web3
  chainId: number
  deactivate: () => void
}

export interface Web3ContextConnected {
  status: 'connected'
  connectionKind: ConnectionKind
  web3: Web3
  chainId: number
  deactivate: () => void
  account: string
  magicLinkEmail?: string
}

export interface Web3ContextError extends Connectable {
  status: 'error'
  error: Error
  deactivate: () => void
}

export type Web3Context =
  | Web3ContextNotConnected
  | Web3ContextConnecting
  | Web3ContextConnectingHWSelectAccount
  | Web3ContextError
  | Web3ContextConnectedReadonly
  | Web3ContextConnected
