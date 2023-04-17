import { NetworkIds } from 'blockchain/networkIds'

import { goerliContracts } from './goerli'
import { mainnetContracts } from './mainnet'

export const allNetworksContracts = {
  [NetworkIds.MAINNET]: mainnetContracts,
  [NetworkIds.HARDHAT]: mainnetContracts,
  [NetworkIds.GOERLI]: goerliContracts,
}

export const getNetworkContracts = (networkId: NetworkIds) => allNetworksContracts[networkId]

export type AllNetworksContractsType = typeof allNetworksContracts
