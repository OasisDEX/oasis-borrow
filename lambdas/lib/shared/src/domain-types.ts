export type Address = `0x${string}`

export enum Network {
  MAINNET = 'mainnet',
  GOERLI = 'goerli',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  BASE = 'base',
  SEPOLIA = 'sepolia',
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
  SEPOLIA = 11155111,
}

export const isChainId = (chainId: unknown): chainId is ChainId => {
  if (typeof chainId !== 'number') {
    return false
  }
  return Object.values(ChainId).includes(chainId)
}

export const NetworkByChainID: Record<ChainId, Network> = {
  [ChainId.MAINNET]: Network.MAINNET,
  [ChainId.ARBITRUM]: Network.ARBITRUM,
  [ChainId.OPTIMISM]: Network.OPTIMISM,
  [ChainId.BASE]: Network.BASE,
  [ChainId.SEPOLIA]: Network.SEPOLIA,
}

export enum ProtocolId {
  AAVE3 = 'aave3',
  SPARK = 'spark',
}

export const isProtocolId = (protocolId: unknown): protocolId is ProtocolId => {
  if (typeof protocolId !== 'string') {
    return false
  }
  return Object.values(ProtocolId).includes(protocolId as ProtocolId)
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
  protocolId: ProtocolId
  collateralAsset: PortfolioMigrationAsset
  debtAsset: PortfolioMigrationAsset
}

export type PortfolioMigrationsResponse = {
  migrations: PortfolioMigration[]
}
