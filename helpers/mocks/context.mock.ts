import { contract, ContractDesc } from '@oasisdex/web3-context'
import { networksById } from 'blockchain/config'
import {
  Context,
  ContextConnected,
  createContext$,
  createContextConnected$,
  createWeb3ContextConnected$,
} from 'blockchain/network'
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
}

export const mockContextConnected: ContextConnected = {
  contract: <T>(c: ContractDesc) => contract(new Web3(), c) as T,
  web3ProviderGetPastLogs: {} as Web3,
  ...networksById['42'],
  ...mockWeb3ContextConnected,
}
