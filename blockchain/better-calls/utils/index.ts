import { NetworkIds } from 'blockchain/networkIds'
import { ethers } from 'ethers'

export type SupportedNetworks = NetworkIds.MAINNET | NetworkIds.OPTIMISMMAINNET | NetworkIds.GOERLI

export type Factory<T> = {
  connect: (address: string, rpcProvider: ethers.providers.Provider) => T
}

export interface BaseParameters {
  networkId: SupportedNetworks
}

// type ContractKey = keyof AllNetworksContractsType[AaveV3SupportedNetwork]

// export interface ContractForNetwork<T> {
//   contract: T
//   contractGenesis: number
//   networkId: NetworkIds
//   address: string
//   tokenMappings: Record<string, { address: string }>
// }
