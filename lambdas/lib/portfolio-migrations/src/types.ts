import { ChainId, PortfolioMigrationAsset, Protocol } from 'shared/domain-types'

export type ProtocolMigrationAssets = {
  debtAssets: PortfolioMigrationAsset[]
  collAssets: PortfolioMigrationAsset[]
  chainId: ChainId
  protocolId: Protocol
}
