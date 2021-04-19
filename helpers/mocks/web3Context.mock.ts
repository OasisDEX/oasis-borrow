import {
  Web3Context,
  Web3ContextConnected,
  Web3ContextConnectedReadonly,
} from '@oasisdex/web3-context'
import { Observable, of } from 'rxjs'
import Web3 from 'web3'

const mockWeb3ContextNotConnected: Web3Context = {
  status: 'notConnected',
  connect: () => null,
  connectLedger: () => null,
}

export const mockWeb3ContextConnectedReadonly: Web3ContextConnectedReadonly = {
  status: 'connectedReadonly',
  connectionKind: 'injected',
  web3: new Web3(),
  chainId: 1,
  deactivate: () => null,
  connect: () => null,
  connectLedger: () => null,
}

export const mockWeb3ContextConnected: Web3ContextConnected = {
  status: 'connected',
  connectionKind: 'injected',
  web3: new Web3(),
  chainId: 1,
  deactivate: () => null,
  account: '0xUserAddress',
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
