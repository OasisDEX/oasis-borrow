import type { AbiInput, AbiItem } from 'web3-utils'

export type Abi = Omit<AbiItem, 'type' | 'stateMutability' | 'inputs'> & {
  internalType?: string
  type: string // 'function' | 'constructor' | 'event' | 'fallback'
  stateMutability?: string // 'pure' | 'view' | 'nonpayable' | 'payable'
  inputs?: (AbiInput & { internalType?: string })[]
}
