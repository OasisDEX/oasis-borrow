import {
  Context,
  ContextConnected,
  createContext$,
  createContextConnected$,
  createWeb3ContextConnected$,
} from 'blockchain/network'
import { networksById } from 'blockchain/networks'
import { contract, ContractDesc } from 'features/web3Context'
import Web3 from 'web3'

import {
  mockWeb3Context$,
  mockWeb3ContextConnected,
  mockWeb3ContextConnectedReadonly,
  MockWeb3ContextProps,
} from './web3Context.mock'

export function mockContext$(props: MockWeb3ContextProps) {
  const web3Context$ = mockWeb3Context$(props)
  return createContext$(createWeb3ContextConnected$(web3Context$))
}

export function mockContextConnected$(props: MockWeb3ContextProps) {
  return createContextConnected$(mockContext$(props))
}

export const mockContext: Context = {
  contract: <T>(c: ContractDesc) => contract(new Web3(), c) as T,
  web3ProviderGetPastLogs: {} as Web3,
  ...networksById['42'],
  ...mockWeb3ContextConnectedReadonly,
  account: undefined,
  rpcProvider: {} as any,
}

export const mockContextConnected: ContextConnected = {
  contract: <T>(c: ContractDesc) => contract(new Web3(), c) as T,
  web3ProviderGetPastLogs: {} as Web3,
  ...networksById['42'],
  ...mockWeb3ContextConnected,
  rpcProvider: {} as any,
}
