export type Address = `0x${string}`

export enum Network {
  MAINNET = 'mainnet',
  GOERLI = 'goerli',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  BASE = 'base',
}

export enum NetworkNames {
  ethereumMainnet = 'ethereum',
  ethereumGoerli = 'ethereum_goerli',
  arbitrumMainnet = 'arbitrum',
  arbitrumGoerli = 'arbitrum_goerli',
  polygonMainnet = 'polygon',
  polygonMumbai = 'polygon_mumbai',
  optimismMainnet = 'optimism',
  optimismGoerli = 'optimism_goerli',
  baseMainnet = 'base',
  baseGoerli = 'base_goerli',
}

export enum ChainId {
  MAINNET = 1,
  ARBITRUM = 42161,
  OPTIMISM = 10,
  BASE = 8453,
}

export enum Protocol {
  AAVE3 = 'aave3',
  SPARK = 'spark',
}

export type Token = {
  symbol: string
  decimals: bigint
  address: Address
}

export type DetailsType =
  | 'netValue'
  | 'netValueEarnActivePassive'
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

export type PortfolioOverviewResponse = {
  suppliedUsdValue: number
  suppliedPercentageChange: number
  borrowedUsdValue: number
  borrowedPercentageChange: number
  summerUsdValue: number
  summerPercentageChange: number
  allAssetsUsdValue: number
}

export type PortfolioWalletAsset = {
  name: string
  network: NetworkNames
  symbol: string
  priceUSD: number
  price24hChange?: number
  balance: number
  balanceUSD: number
}

export type PortfolioAssetsResponse = {
  totalAssetsUsdValue: number
  totalAssetsPercentageChange: number
  assets: PortfolioWalletAsset[]
}

export type PortfolioMigrationAsset = {
  symbol: string
  balance: bigint
  balanceDecimals: bigint
  price: bigint
  priceDecimals: bigint
  usdValue: number
}

export type PortfolioMigration = {
  chainId: ChainId
  protocolId: Protocol
  collateralAsset: PortfolioMigrationAsset
  debtAsset: PortfolioMigrationAsset
}

export type PortfolioMigrationsResponse = {
  migrations: PortfolioMigration[]
}
