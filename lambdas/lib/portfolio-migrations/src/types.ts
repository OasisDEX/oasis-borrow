import { ChainId, PortfolioMigrationAsset, ProtocolId } from 'shared/domain-types'

export type ProtocolMigrationAssets = {
  debtAssets: PortfolioMigrationAsset[]
  collAssets: PortfolioMigrationAsset[]
  chainId: ChainId
  protocolId: ProtocolId
}
