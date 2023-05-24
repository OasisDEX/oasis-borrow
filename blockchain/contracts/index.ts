import { NetworkIds } from 'blockchain/networkIds'
import { getContractNetworkByWalletNetwork } from 'helpers/networkHelpers'

import { arbitrumContracts } from './arbitrum'
import { goerliContracts } from './goerli'
import { mainnetContracts } from './mainnet'
import { optimismContracts } from './optimism'

export const allNetworksContracts = {
  [NetworkIds.MAINNET]: mainnetContracts,
  [NetworkIds.HARDHAT]: mainnetContracts,
  [NetworkIds.GOERLI]: goerliContracts,
  [NetworkIds.OPTIMISMMAINNET]: optimismContracts,
  // empty contracts config - to be filled
  [NetworkIds.ARBITRUMMAINNET]: arbitrumContracts,
  [NetworkIds.ARBITRUMGOERLI]: {},
  [NetworkIds.POLYGONMAINNET]: {},
  [NetworkIds.POLYGONMUMBAI]: {},
  [NetworkIds.OPTIMISMGOERLI]: {},
  [NetworkIds.EMPTYNET]: {},
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
