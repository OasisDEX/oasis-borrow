import type { ethers } from 'ethers'
import type {
  Web3Context,
  Web3ContextConnected,
  Web3ContextConnectedReadonly,
} from 'features/web3Context'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'
import Web3 from 'web3'

const mockWeb3ContextNotConnected: Web3Context = {
  status: 'notConnected',
  connect: () => Promise.resolve(true),
}

export const mockWeb3ContextConnectedReadonly: Web3ContextConnectedReadonly = {
  status: 'connectedReadonly',
  connectionKind: 'injected',
  web3: new Web3(),
  chainId: 1,
  walletLabel: undefined,
  connectionMethod: 'web3-onboard',
}

export const mockWeb3ContextConnected: Web3ContextConnected = {
  status: 'connected',
  connectionKind: 'injected',
  web3: new Web3(),
  chainId: 1,
  account: '0xUserAddress',
  walletLabel: 'MetaMask',
  connectionMethod: 'web3-onboard',
  transactionProvider: {} as ethers.Signer,
}

export interface MockWeb3ContextProps {
  status: 'notConnected' | 'connectedReadonly' | 'connected'
  account?: string
}

export function mockWeb3Context$({
  status,
  account,
}: MockWeb3ContextProps): Observable<Web3Context> {
  return of(
    status === 'notConnected'
      ? mockWeb3ContextNotConnected
      : status === 'connectedReadonly'
        ? mockWeb3ContextConnectedReadonly
        : {
            ...mockWeb3ContextConnected,
            ...(account && { account }),
          },
  )
}
