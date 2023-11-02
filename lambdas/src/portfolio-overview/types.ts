export type ProtocolAsset = {
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

export type WalletAsset = {
  usd_value: number
}

export type PortfolioOverviewResponse = {
  walletBalanceUsdValue: number
  suppliedUsdValue: number
  suppliedPercentageChange: number
  borrowedUsdValue: number
  borrowedPercentageChange: number
}
