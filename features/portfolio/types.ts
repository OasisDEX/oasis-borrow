import type { NetworkNames } from 'blockchain/networks'
import type { ProductType, StrategyType } from 'features/aave/types'
import type { LendingProtocol } from 'lendingProtocols'

export type DebankTokenReply = {
  id: string
  chain: string
  name: string
  symbol: string
  display_symbol: string
  optimized_symbol: string
  decimals: number
  logo_url: string
  protocol_id: string
  price: number
  price_24h_change: number
  is_verified: boolean
  is_core: boolean
  is_wallet: boolean
  time_at: number
  amount: number
  raw_amount: number
  raw_amount_hex_str: string
}
export type DebankTokensReply = DebankTokenReply[]

export type PortfolioAssetsToken = {
  name: string
  symbol: string
  network: NetworkNames
  priceUSD: number
  price24hChange: number
  balance: number
  balanceUSD: number
}

export type PortfolioAssetsReply = {
  totalUSDAssets: number
  totalUSDAssets24hChange: number
  assets: PortfolioAssetsToken[]
}

type AutomationType = {
  enabled: boolean
  price?: number
}

type DetailsType =
  | 'netValue'
  | 'pnl'
  | 'liquidationPrice'
  | 'ltv'
  | 'multiple'
  | 'collateralLocked'
  | 'totalDebt'
  | 'borrowRate'
  | 'lendingRange'
  | 'earnings'
  | 'apy'
  | '90dApy'
  | 'suppliedToken'
  | 'suppliedTokenBalance'
  | 'borrowedToken'
  | 'borrowedTokenBalance'

export type PortfolioPosition = {
  positionId: number
  type: ProductType
  network: NetworkNames
  protocol: LendingProtocol
  strategyType?: StrategyType
  lendingType?: 'active' | 'passive' | 'loop' | 'staking' | 'pool' // are these all types?
  openDate: number // epoch based on block height timestamp
  availableToMigrate?: boolean
  tokens: {
    supply: {
      symbol: string
      amount: number
      amountUSD: number
    }
    borrow?: {
      symbol: string
      amount: number
      amountUSD: number
    }
  }
  details: {
    type: DetailsType
    value: string
    accent?: 'positive' | 'negative'
    subvalue?: string
  }[]
  automations: {
    stopLoss?: AutomationType
    takeProfit?: AutomationType
    autoBuy?: AutomationType
    autoSell?: AutomationType
  }
}

export type PortfolioPositionsReply = {
  positions: PortfolioPosition[]
}
