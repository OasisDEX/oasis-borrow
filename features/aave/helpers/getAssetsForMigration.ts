import type { NetworkIds } from 'blockchain/networks'
import { networkSetById } from 'blockchain/networks'
import type { PositionId } from 'features/aave/types'
import { getPortfolioMigrationsResponse } from 'features/migrations/migrationsClient'
import { LendingProtocolByProtocolId, NetworkIdByChainId } from 'features/migrations/types'
import { safeGetAddress } from 'helpers/safeGetAddress'
import type { LendingProtocol } from 'lendingProtocols'

export interface GetAssetsForMigrationArgs {
  network: NetworkIds
  protocol: LendingProtocol
  positionId: Pick<PositionId, 'positionAddress'>
}

export interface AssetForMigration {
  collateral: string
  debt: string
  positionAddress: string
  walletAddress: string
  positionAddressType: 'EOA' | 'DS_PROXY'
}
export async function getAssetsForMigration(
  args: GetAssetsForMigrationArgs,
): Promise<AssetForMigration | undefined> {
  const address = safeGetAddress(args.positionId.positionAddress)
  if (address === undefined) {
    return undefined
  }
  const network = networkSetById[args.network]
  const fork = network.isCustomFork
    ? {
        customRpcUrl: network.rpcUrl,
        chainId: args.network,
      }
    : undefined
  const migrations = await getPortfolioMigrationsResponse(address, fork)
  if (migrations === undefined) {
    return undefined
  }

  return migrations.migrationsV2
    .filter((migration) => {
      const networkMigration = NetworkIdByChainId[migration.chainId]
      const migrationProtocol = LendingProtocolByProtocolId[migration.protocolId]
      return (
        networkMigration === args.network &&
        migrationProtocol === args.protocol &&
        migration.positionAddress === address
      )
    })
    .map((migration) => {
      return {
        collateral: migration.collateralAsset.symbol,
        debt: migration.debtAsset.symbol,
        positionAddress: migration.positionAddress,
        positionAddressType: migration.positionAddressType,
        walletAddress: migration.walletAddress,
      }
    })[0]
}
