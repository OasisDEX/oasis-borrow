import type { Tokens } from '@prisma/client'
import * as erc20 from 'blockchain/abi/erc20.json'
import { getContractNetworkByWalletNetwork, NetworkIds, networkSetById } from 'blockchain/networks'
import type { ContractDesc } from 'features/web3Context'

import { arbitrumContracts } from './arbitrum'
import { baseContracts } from './base'
import { goerliContracts } from './goerli'
import { mainnetContracts } from './mainnet'
import { optimismContracts } from './optimism'

// this const will contain contracts of tokens, that aren't a part of original config
// but identified by identifyTokens$ observable whenever it's called
const extendedTokensContracts: { [key: string]: ContractDesc & { genesisBlock: number } } = {}

export const allNetworksContracts = {
  [NetworkIds.MAINNET]: mainnetContracts,
  [NetworkIds.HARDHAT]: mainnetContracts,
  [NetworkIds.GOERLI]: goerliContracts,
  [NetworkIds.OPTIMISMMAINNET]: optimismContracts,
  // empty contracts config - to be filled
  [NetworkIds.ARBITRUMMAINNET]: arbitrumContracts,
  [NetworkIds.BASEMAINNET]: baseContracts,
  [NetworkIds.ARBITRUMGOERLI]: {},
  [NetworkIds.BASEGOERLI]: {},
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

  let finalNetworkId = correctNetworkId

  if (!contracts && networkConfig.isCustomFork) {
    const parentConfig = networkConfig.getParentNetwork()
    if (!parentConfig) {
      throw new Error(
        `Can't find parent network for ${correctNetworkId} chain  even though it's a custom fork`,
      )
    }
    finalNetworkId = parentConfig.id
    contracts = allNetworksContracts[parentConfig.id]
  }
  if (!contracts) {
    throw new Error(
      `Invalid contract chain id (${correctNetworkId}) provided or not implemented yet`,
    )
  }

  const contractsForWithToknes = contracts

  ensureTokensExist(finalNetworkId, contractsForWithToknes)

  // ETH needs to be first because we use the `WETH` address in that configuration. To ensure that ETH is placed before WETH, we put it at the top of the list.
  const tokens: Record<string, ContractDesc> = {
    ETH: contractsForWithToknes.tokens.ETH,
    ...contractsForWithToknes.tokens,
    ...extendedTokensContracts,
  }

  return {
    ...contracts,
    tokens,
  } as Pick<AllNetworksContractsType, NetworkId>[NetworkId]
}

export function extendTokensContracts(tokens: Tokens[]): void {
  tokens.forEach((token) => {
    extendedTokensContracts[token.symbol] = {
      abi: erc20,
      address: token.address,
      genesisBlock: 0,
    }
  })
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

export function ensureGivenTokensExist(
  chainId: NetworkIds,
  contracts: ReturnType<typeof getNetworkContracts>,
  tokens: ReadonlyArray<string>,
): asserts contracts is { tokens: { [K in (typeof tokens)[number]]: ContractDesc } } {
  ensureTokensExist(chainId, contracts)
  const notFoundTokens = tokens.filter((p) => !contracts.tokens.hasOwnProperty(p))
  if (notFoundTokens.length > 0) {
    throw new Error(
      `Can't find tokens definitions: ${JSON.stringify(
        notFoundTokens,
      )}. searching for: ${JSON.stringify(tokens)} on ${chainId} chain`,
    )
  }
}

export function ensureChainlinkTokenPairsExist(
  chainId: NetworkIds,
  contracts: ReturnType<typeof getNetworkContracts>,
  tokenPairs: ReadonlyArray<string>,
): asserts contracts is {
  chainlinkPriceOracle: {
    [K in (typeof tokenPairs)[number]]: ContractDesc
  }
} {
  if (!contracts.hasOwnProperty('chainlinkPriceOracle')) {
    throw new Error(`Can't find chainlinkTokenPairs definition on ${chainId} chain`)
  }

  const chainlinkPriceOracle = (contracts as { chainlinkPriceOracle: unknown }).chainlinkPriceOracle

  if (typeof chainlinkPriceOracle !== 'object' || chainlinkPriceOracle === null) {
    throw new Error(`chainlinkPriceOracle definition on ${chainId} chain is not an object`)
  }

  if (tokenPairs.some((p) => !chainlinkPriceOracle.hasOwnProperty(p))) {
    throw new Error(
      `Can't find chainlinkTokenPairs definitions: ${JSON.stringify(
        tokenPairs,
      )} on ${chainId} chain`,
    )
  }
}

export * from './extend-contract'
