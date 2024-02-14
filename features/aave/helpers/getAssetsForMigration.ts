import type { NetworkIds } from 'blockchain/networks'
import type { PositionId } from 'features/aave/types'
import { getPortfolioMigrationsResponse } from 'features/migrations/migrationsClient'
import { LendingProtocolByProtocolId } from 'features/migrations/types'
import { safeGetAddress } from 'helpers/safeGetAddress'
import type { LendingProtocol } from 'lendingProtocols'

export interface GetAssetsForMigrationArgs {
  network: NetworkIds
  protocol: LendingProtocol
  positionId: PositionId
}

export interface AssetForMigration {
  collateral: string
  debt: string
}
export async function getAssetsForMigration(
  args: GetAssetsForMigrationArgs,
): Promise<AssetForMigration | undefined> {
  const address = safeGetAddress(args.positionId.walletAddress)
  if (address === undefined) {
    return undefined
  }
  const migrations = await getPortfolioMigrationsResponse(address)
  if (migrations === undefined) {
    return undefined
  }

  return migrations.migrations
    .filter((migration) => {
      return (
        migration.chainId.toString() === args.network.toString() &&
        LendingProtocolByProtocolId[migration.protocolId] === args.protocol
      )
    })
    .map((migration) => {
      return {
        collateral: migration.collateralAsset.symbol,
        debt: migration.debtAsset.symbol,
      }
    })[0]
}
