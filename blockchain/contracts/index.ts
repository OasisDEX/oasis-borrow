import { getContractNetworkByWalletNetwork, NetworkIds, networkSetById } from 'blockchain/networks'
import { ContractDesc } from 'features/web3Context'

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

  const networkConfig = networkSetById[correctNetworkId]
  let contracts: Record<string, unknown> = allNetworksContracts[correctNetworkId]

  if (!contracts && networkConfig.isCustomFork) {
    const parentConfig = networkConfig.getParentNetwork()
    if (!parentConfig) {
      throw new Error(
        `Can't find parent network for ${correctNetworkId} chain  even though it's a custom fork`,
      )
    }
    contracts = allNetworksContracts[parentConfig.id]
  }
  if (!contracts) {
    throw new Error('Invalid contract chain id provided or not implemented yet')
  }
  return contracts as Pick<AllNetworksContractsType, NetworkId>[NetworkId]
}

export function ensureContractsExist(
  chainId: NetworkIds,
  contracts: ReturnType<typeof getNetworkContracts>,
  properties: ReadonlyArray<string>,
): asserts contracts is {
  [K in (typeof properties)[number]]: ContractDesc & { genesisBlock: number }
} {
  if (properties.some((p) => !contracts.hasOwnProperty(p))) {
    throw new Error(
      `Can't find contracts definitions: ${JSON.stringify(properties)} on ${chainId} chain`,
    )
  }
}

export function ensurePropertiesExist(
  chainId: NetworkIds,
  contracts: ReturnType<typeof getNetworkContracts>,
  properties: ReadonlyArray<string>,
): asserts contracts is {
  [K in (typeof properties)[number]]: string
} {
  if (properties.some((p) => !contracts.hasOwnProperty(p))) {
    throw new Error(`Can't find properties: ${JSON.stringify(properties)} on ${chainId} chain`)
  }
}

export function ensureSafeConfirmationsExist(
  chainId: NetworkIds,
  contracts: ReturnType<typeof getNetworkContracts>,
): asserts contracts is { safeConfirmations: number } {
  if (!contracts.hasOwnProperty('safeConfirmations')) {
    throw new Error(`Can't find safeConfirmations definition on ${chainId} chain`)
  }
}

export function ensureEtherscanExist(
  chainId: NetworkIds,
  contracts: ReturnType<typeof getNetworkContracts>,
): asserts contracts is { etherscan: { url: string; apiUrl: string } } {
  if (!contracts.hasOwnProperty('etherscan')) {
    throw new Error(`Can't find etherscan definition on ${chainId} chain`)
  }
}

export function ensureTokensExist(
  chainId: NetworkIds,
  contracts: ReturnType<typeof getNetworkContracts>,
): asserts contracts is { tokens: Record<string, ContractDesc> } {
  if (!contracts.hasOwnProperty('tokens')) {
    throw new Error(`Can't find tokens definition on ${chainId} chain`)
  }
}

export * from './extend-contract'
