import { ensureTokensExist, getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { findKey } from 'lodash'

import type { tokens } from './tokensMetadata.constants'
import { ALLOWED_AUTOMATION_ILKS, tokensBySymbol } from './tokensMetadata.constants'
import type { TokenMetadataType, TokenSymbolType } from './tokensMetadata.types'

export function getToken(tokenSymbol: TokenSymbolType): TokenMetadataType {
  if (!tokensBySymbol[tokenSymbol]) {
    throw new Error(`No meta information for token: ${tokenSymbol}`)
  }
  return tokensBySymbol[tokenSymbol]
}

export function getTokenGuarded(
  tokenSymbol: TokenSymbolType,
): ReturnType<typeof getToken> | undefined {
  return Object.keys(tokensBySymbol).includes(tokenSymbol) ? getToken(tokenSymbol) : undefined
}

export function getTokens(tokenSymbol: TokenSymbolType[]): typeof tokens {
  if (tokenSymbol instanceof Array) {
    return tokenSymbol.map(getToken)
  }
  throw new Error(`tokenSymbol should be an array, got ${tokenSymbol}`)
}

// @deprecated
export function getTokenSymbolFromAddress(chainId: NetworkIds, tokenAddress: string) {
  const token = findKey(
    getNetworkContracts(NetworkIds.MAINNET, chainId).tokens,
    (contractDesc) => contractDesc.address.toLowerCase() === tokenAddress.toLowerCase(),
  )
  if (!token) {
    throw new Error(`could not find token for address ${tokenAddress}`)
  }

  return token
}

export function getTokenSymbolBasedOnAddress(chainId: NetworkIds, tokenAddress: string) {
  const contracts = getNetworkContracts(chainId)
  ensureTokensExist(chainId, contracts)
  const { tokens } = contracts

  const token = findKey(
    tokens,
    (contractDesc) => contractDesc.address.toLowerCase() === tokenAddress.toLowerCase(),
  )
  if (!token) {
    throw new Error(`could not find token for address ${tokenAddress} for chain ${chainId}`)
  }

  return token
}

export function isSupportedAutomationIlk(networkId: NetworkIds, ilk: string) {
  return ALLOWED_AUTOMATION_ILKS[networkId]?.includes(ilk) ?? false
}
