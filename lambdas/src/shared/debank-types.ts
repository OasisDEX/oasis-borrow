import { type } from 'os'

export type DebankToken = {
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
  price_24h_change?: number
  is_verified: boolean
  is_core: boolean
  is_wallet: boolean
  time_at: number
  amount: number
  is_collateral?: boolean
  raw_amount?: number
  raw_amount_hex_str?: string
}

export type DebankSimpleProtocol = {
  id: string
  chain: string
  name: string
  site_url: string
  logo_url: string
  has_supported_portfolio: boolean
  tvl: number
  net_usd_value: number
  asset_usd_value: number
  debt_usd_value: number
}

export type DebankComplexProtocol = {
  id: string
  chain: string
  name: string
  site_url: string
  logo_url: string
  has_supported_portfolio: boolean
  tvl: number
  portfolio_item_list: DebankPortfolioItemObject[]
}

export type DebankPortfolioItemObject = {
  stats: {
    asset_usd_value: number
    debt_usd_value: number
    net_usd_value: number
  }
  update_at: number
  name: DebankType
  detail_types: string
  detail: {
    supply_token_list: DebankToken[]
    reward_token_list: DebankToken[]
    borrow_token_list: DebankToken[]
  }
  proxy_detail: {
    project: {
      id: string
      name: string
      site_url: string
      logo_url: string
    }
    proxy_contract_id: string
  }
  pool: {
    id: string
    controller: string
    chain: string
    project_id: string
    time_at?: number
  }
  position_index: string
}

export type DebankType =
  | 'common'
  | 'locked'
  | 'lending'
  | 'leveraged_farming'
  | 'vesting'
  | 'reward'
  | 'options_seller'
  | 'options_buyer'
  | 'insurance_seller'
  | 'insurance_buyer'
  | 'perpetuals'
