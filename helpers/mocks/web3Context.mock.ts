import {
  Web3Context,
  Web3ContextConnected,
  Web3ContextConnectedReadonly,
} from '@oasisdex/web3-context'
import { Observable, of } from 'rxjs'
import Web3 from 'web3'

import { getMockContextConnected } from './context.mock'

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
const kovanNetworkId = 42

export const validMockAddresses = {
  account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  proxy: '0xf7203265834862bA831bc14e8999C2D1dBa7A645',
}

export const mockWeb3ContextConnected: Web3ContextConnected = {
  status: 'connected',
  connectionKind: 'injected',
  web3: new Web3(),
  chainId: kovanNetworkId,
  deactivate: () => null,
  account: '0xUserAddress',
}

export interface MockWeb3ContextProps {
  status: 'notConnected' | 'connectedReadonly' | 'connected'
  account?: string
  networkId?: number
  setupProvider?: boolean
}

export function mockWeb3Context$({
  status,
  account,
  networkId = kovanNetworkId,
  setupProvider,
}: MockWeb3ContextProps): Observable<Web3Context> {
  return of(
    status === 'notConnected'
      ? mockWeb3ContextNotConnected
      : status === 'connectedReadonly'
      ? mockWeb3ContextConnectedReadonly
      : {
          ...getMockContextConnected({ networkId, setupProvider }),
          ...(account && { account }),
        },
  )
}
