import { getContractNetworkByWalletNetwork, NetworkIds } from 'blockchain/networks'

import { goerliContracts } from './goerli'
import { mainnetContracts } from './mainnet'
import { optimismContracts } from './optimism'

export const allNetworksContracts = {
  [NetworkIds.MAINNET]: mainnetContracts,
  [NetworkIds.HARDHAT]: mainnetContracts,
  [NetworkIds.GOERLI]: goerliContracts,
  // empty contracts config - to be filled
  [NetworkIds.ARBITRUMMAINNET]: {
    cacheApi: '',
  },
  [NetworkIds.ARBITRUMGOERLI]: {
    cacheApi: '',
  },
  [NetworkIds.POLYGONMAINNET]: {
    cacheApi: '',
  },
  [NetworkIds.POLYGONMUMBAI]: {
    cacheApi: '',
  },
  [NetworkIds.OPTIMISMMAINNET]: optimismContracts,
  [NetworkIds.OPTIMISMGOERLI]: {
    cacheApi: '',
  },
  [NetworkIds.EMPTYNET]: {
    cacheApi: '',
  },
}

export type AllNetworksContractsType = typeof allNetworksContracts

export function getNetworkContracts<NetworkId extends NetworkIds>(
  contractChainId: NetworkId,
  walletChainId?: NetworkIds,
) {
  const correctNetworkId = walletChainId
    ? getContractNetworkByWalletNetwork(contractChainId, walletChainId)
    : contractChainId
  if (!allNetworksContracts[correctNetworkId]) {
    throw new Error('Invalid contract chain id provided or not implemented yet')
  }
  return allNetworksContracts[correctNetworkId] as Pick<
    AllNetworksContractsType,
    NetworkId
  >[NetworkId]
}
