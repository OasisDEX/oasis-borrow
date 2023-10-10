import { tokenConfigs } from 'blockchain/token-metadata-list'
import { keyBy } from 'lodash'

import { NetworkIds } from './networks'
import type { CoinTag, TokenConfig } from './TokenConfig'

export const tokens: TokenConfig[] = [...tokenConfigs]
export const tokensBySymbol = keyBy(tokens, 'symbol')

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

export const ALLOWED_AUTOMATION_ILKS: Partial<Record<NetworkIds, string[]>> = {
  [NetworkIds.MAINNET]: [
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
  [NetworkIds.GOERLI]: [
    'ETH-A',
    'ETH-B',
    'ETH-C',
    'WSTETH-A',
    'WBTC-A',
    'WBTC-B',
    'WBTC-C',
    'RETH-A',
  ],
}
