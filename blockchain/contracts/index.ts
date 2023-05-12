import { NetworkIds } from 'blockchain/networkIds'
import { getContractNetworkByWalletNetwork } from 'helpers/networkHelpers'

import { goerliContracts } from './goerli'
import { mainnetContracts } from './mainnet'

export const allNetworksContracts = {
  [NetworkIds.MAINNET]: mainnetContracts,
  [NetworkIds.HARDHAT]: mainnetContracts,
  [NetworkIds.GOERLI]: goerliContracts,
  // empty contracts config - to be filled
  [NetworkIds.ARBITRUMMAINNET]: {},
  [NetworkIds.ARBITRUMGOERLI]: {},
  [NetworkIds.POLYGONMAINNET]: {},
  [NetworkIds.POLYGONMUMBAI]: {},
  [NetworkIds.OPTIMISMMAINNET]: {},
  [NetworkIds.OPTIMISMGOERLI]: {},
  [NetworkIds.EMPTYNET]: {},
}

export type AllNetworksContractsType = typeof allNetworksContracts

export function getNetworkContracts<NetworkId extends NetworkIds>(
  contractChainId: NetworkId,
  walletChainId: NetworkIds,
) {
  const correctNetworkId = getContractNetworkByWalletNetwork(contractChainId, walletChainId)
  if (!allNetworksContracts[correctNetworkId]) {
    throw new Error('Invalid contract chain id provided or not implemented yet')
  }
  return allNetworksContracts[correctNetworkId] as Pick<
    AllNetworksContractsType,
    NetworkId
  >[NetworkId]
}
