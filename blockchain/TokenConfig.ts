import type { IconProps } from 'components/Icon.types'
import type { ElementOf } from 'ts-essentials'

export const COIN_TAGS = ['stablecoin', 'lp-token'] as const
export type CoinTag = ElementOf<typeof COIN_TAGS>
export interface TokenConfig {
  symbol: string
  rootToken?: string
  precision: number
  digits: number
  maxSell?: string
  name: string
  icon: IconProps['icon']
  iconCircle: IconProps['icon']
  iconUnavailable?: boolean
  coinpaprikaTicker?: string
  coinpaprikaFallbackTicker?: string
  tags: CoinTag[]
  color?: string
  token0?: string
  token1?: string
  coinbaseTicker?: string
  coinGeckoTicker?: string
  coinGeckoId?: string
  background?: string
  digitsInstant?: number
  safeCollRatio?: number
  oracleTicker?: string
  source?: string
}
