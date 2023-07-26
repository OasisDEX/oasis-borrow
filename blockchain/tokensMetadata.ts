import { ensureTokensExist, getNetworkContracts } from 'blockchain/contracts'
import { MainNetworkNames, NetworkIds } from 'blockchain/networks'
import {
  aaveV2TokensMetadata,
  aaveV3TokensMetadata,
  ajnaTokensMetadata,
  makerTokensMetadata,
} from 'blockchain/token-metadata-list'
import { LendingProtocol } from 'lendingProtocols'
import { findKey, keyBy } from 'lodash'
import type { ElementOf } from 'ts-essentials'

export interface TokenConfig {
  symbol: string
  rootToken?: string
  precision: number
  digits: number
  maxSell?: string
  name: string
  icon: string
  iconCircle: string
  coinpaprikaTicker?: string
  coinpaprikaFallbackTicker?: string
  tags: CoinTag[]
  color: string
  bannerIcon: string
  bannerGif: string
  token0?: string
  token1?: string
  coinbaseTicker?: string
  coinGeckoTicker?: string
  coinGeckoId?: string
  background: string
  digitsInstant?: number
  safeCollRatio?: number
  protocol: LendingProtocol
  chain: MainNetworkNames
}

export type SimplifiedTokenConfig = Pick<TokenConfig, 'digits' | 'name' | 'precision' | 'symbol'>

export const COIN_TAGS = ['stablecoin', 'lp-token'] as const
export type CoinTag = ElementOf<typeof COIN_TAGS>

export const tokens: TokenConfig[] = [
  ...makerTokensMetadata,
  ...aaveV2TokensMetadata,
  ...aaveV3TokensMetadata,
  ...ajnaTokensMetadata,
]

// ticker comes from coinpaprika api https://api.coinpaprika.com/v1/tickers
export const tokensBySymbol = keyBy(tokens, 'symbol')

export type TokenSymbolType = ElementOf<typeof tokens>['symbol']
export type TokenMetadataType = (typeof tokens)[number]

export function getToken(tokenSymbol: TokenSymbolType): TokenMetadataType {
  if (!tokensBySymbol[tokenSymbol]) {
    throw new Error(`No meta information for token: ${tokenSymbol}`)
  }
  return tokensBySymbol[tokenSymbol]
}

export function getTokens(tokenSymbol: TokenSymbolType[]): typeof tokens {
  if (tokenSymbol instanceof Array) {
    return tokenSymbol.map(getToken)
  }
  throw new Error(`tokenSymbol should be an array, got ${tokenSymbol}`)
}

export function getTokensWithChain(
  tokenSymbol: TokenSymbolType[],
  chain?: MainNetworkNames,
): typeof tokens {
  if (tokenSymbol instanceof Array) {
    return tokenSymbol
      .map(getToken)
      .filter((token) => token.chain === chain || MainNetworkNames.ethereumGoerli)
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

export const ALLOWED_MULTIPLY_TOKENS = tokens
  .filter(
    (token) => !(token.tags as CoinTag[]).some((tag) => tag === 'lp-token' || tag === 'stablecoin'),
  )
  .map((token) => token.symbol)

export const LP_TOKENS = tokens
  .filter((token) => (token.tags as CoinTag[]).includes('lp-token'))
  .map((lpToken) => lpToken.symbol)

export const BTC_TOKENS = tokens
  .filter((token) => token.rootToken === 'BTC' || token.symbol === 'BTC')
  .map((btcToken) => btcToken.symbol)

export const ETH_TOKENS = tokens
  .filter((token) => token.rootToken === 'ETH' || token.symbol === 'ETH')
  .map((ethToken) => ethToken.symbol)

export const ONLY_MULTIPLY_TOKENS = ['GUNIV3DAIUSDC1', 'GUNIV3DAIUSDC2']

const ALLOWED_AUTOMATION_ILKS: Record<string, string[]> = {
  ethereumMainnet: [
    'ETH-A',
    'ETH-B',
    'ETH-C',
    'WBTC-A',
    'WBTC-B',
    'WBTC-C',
    'WSTETH-A',
    'WSTETH-B',
    'RENBTC-A',
    'YFI-A',
    'UNI-A',
    'LINK-A',
    'MANA-A',
    'RETH-A',
  ],
  ethereumGoerli: ['ETH-A', 'ETH-B', 'ETH-C', 'WSTETH-A', 'WBTC-A', 'WBTC-B', 'WBTC-C', 'RETH-A'],
}

export function isSupportedAutomationIlk(network: string, ilk: string) {
  const key = network in ALLOWED_AUTOMATION_ILKS ? network : 'ethereumMainnet'
  return ALLOWED_AUTOMATION_ILKS[key].includes(ilk)
}
