import { ensureTokensExist, getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { findKey } from 'lodash'

import type { tokens } from './tokensMetadata.constants'
import { ALLOWED_AUTOMATION_ILKS, tokensBySymbol } from './tokensMetadata.constants'
import type { TokenMetadataType, TokenSymbolType } from './tokensMetadata.types'
import { error } from 'theme/icons/error'

export const emptyTokenMetadata: TokenMetadataType = {
  symbol: 'UNKNOWN',
  rootToken: '',
  precision: 0,
  digits: 0,
  maxSell: '',
  name: 'UNKNOWN',
  iconUnavailable: false,
  icon: error,
  iconCircle: error,
  tags: [],
}

export function getToken(tokenSymbol: TokenSymbolType): TokenMetadataType {
  if (!tokensBySymbol[tokenSymbol]) {
    throw new Error(`No meta information for token: ${tokenSymbol}`)
  }
  return tokensBySymbol[tokenSymbol]
}

/**
 * Retrieves token metadata for a given token address on a specific network.
 * @dev if the token is not found, it returns empty token metadata
 * @param {string} tokenAddress - The address of the token to look up.
 * @param {NetworkIds} networkId - The ID of the network where the token exists.
 * @returns {TokenMetadataType} The metadata of the token, or empty metadata if not found.
 *
 * @example
 * const tokenMetadata = getTokenByAddress('0x1234...', NetworkIds.MAINNET);
 */
export function getTokenByAddress(tokenAddress: string, networkId: NetworkIds): TokenMetadataType {
  const contracts = getNetworkContracts(networkId)

  if (!('tokens' in contracts)) {
    return emptyTokenMetadata
  }

  const token = findKey(
    contracts.tokens,
    (contractDesc: any) => contractDesc.address.toLowerCase() === tokenAddress.toLowerCase(),
  )
  if (!token) {
    return emptyTokenMetadata
  }
  return getToken(token)
}

/**
 * Retrieves the token metadata for a given token symbol if it exists.
 *
 * @param {TokenSymbolType} tokenSymbol - The symbol of the token to retrieve metadata for.
 * @returns {ReturnType<typeof getToken> | undefined} The token metadata if the token symbol exists, otherwise undefined.
 */
export function getTokenGuarded(
  tokenSymbol: TokenSymbolType,
): ReturnType<typeof getToken> | undefined {
  return Object.keys(tokensBySymbol).includes(tokenSymbol) ? getToken(tokenSymbol) : undefined
}

/**
 * Retrieves the metadata for an array of token symbols.
 *
 * @param {TokenSymbolType[]} tokenSymbol - An array of token symbols to retrieve metadata for.
 * @returns {typeof tokens} An array of token metadata corresponding to the provided token symbols.
 * @throws {Error} If the provided tokenSymbol is not an array.
 */
export function getTokens(tokenSymbol: TokenSymbolType[]): typeof tokens {
  if (tokenSymbol instanceof Array) {
    return tokenSymbol.map(getToken)
  }
  throw new Error(`tokenSymbol should be an array, got ${tokenSymbol}`)
}

/**
 * @deprecated This function is deprecated and will be removed in future versions.
 * Please use getTokenSymbolBasedOnAddress instead.
 */
export function getTokenSymbolFromAddress(chainId: NetworkIds, tokenAddress: string) {
  const token = findKey(
    getNetworkContracts(NetworkIds.MAINNET, chainId).tokens,
    (contractDesc: any) => contractDesc.address.toLowerCase() === tokenAddress.toLowerCase(),
  )
  if (!token) {
    throw new Error(`could not find token for address ${tokenAddress}`)
  }

  return token
}

/**
 * Retrieves the token symbol based on the provided token address and chain ID.
 *
 * @param {NetworkIds} chainId - The ID of the blockchain network.
 * @param {string} tokenAddress - The address of the token.
 * @returns {string} The symbol of the token.
 * @throws {Error} If the token cannot be found for the given address and chain ID.
 */
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

/**
 * Checks if the given ilk is supported for Maker automation on the specified network.
 *
 * @param {NetworkIds} networkId - The ID of the blockchain network.
 * @param {string} ilk - The ilk (collateral type) to check for support.
 * @returns {boolean} True if the ilk is supported for automation, otherwise false.
 */
export function isSupportedAutomationIlk(networkId: NetworkIds, ilk: string) {
  return ALLOWED_AUTOMATION_ILKS[networkId]?.includes(ilk) ?? false
}
