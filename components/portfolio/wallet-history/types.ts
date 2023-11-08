export type PortfolioWalletHistoryResponse = {
  cate_dict: Record<
    string,
    {
      id: string
      name: string
    }
  >
  cex_dict: Record<string, unknown>
  project_dict: Record<string, unknown>
  history_list: PortfolioWalletHistoryItem[]
  token_dict: Record<string, PortfolioWalletHistoryToken>
}

export type PortfolioWalletHistoryToken = {
  chain: string
  credit_score: number
  decimals: number
  display_symbol: unknown
  id: string
  is_core: unknown
  is_scam: boolean
  is_suspicious: boolean
  is_verified: unknown
  is_wallet: boolean
  logo_url: unknown
  name: string
  optimized_symbol: string
  price: unknown
  price_24h_change: unknown
  protocol_id: string
  symbol: string
  time_at: number | null
}

export type PortfolioWalletHistoryReceive = {
  amount: number
  from_addr: string
  token_id: string
}

export type PortfolioWalletHistorySend = {
  amount: number
  to_addr: string
  token_id: string
}

export type PortfolioWalletHistoryTx = {
  eth_gas_fee?: number
  usd_gas_fee?: number
  from_addr: string
  message: unknown
  name: string
  params: unknown[]
  selector: string
  status: number
  to_addr: string
  value: number
}

export type PortfolioWalletHistoryItem = {
  cate_id: string | null
  cex_id: string | null
  chain: string
  id: string
  is_scam: boolean
  other_addr: string
  project_id: string | null
  receives: PortfolioWalletHistoryReceive[]
  sends: PortfolioWalletHistorySend[]
  time_at: number
  token_approve: unknown
  tx: PortfolioWalletHistoryTx
}
