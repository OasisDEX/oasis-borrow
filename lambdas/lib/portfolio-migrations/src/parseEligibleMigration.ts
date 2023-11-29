import { ProtocolMigrationAssets } from './types'
import { getDominantCollAsset } from './getDominantCollAsset'

export const parseEligibleMigration = ({
  debtAssets,
  collAssets,
  chainId,
  protocolId,
}: ProtocolMigrationAssets) => {
  const hasOneDebtAsset = debtAssets.length === 1
  const dominantCollAsset = getDominantCollAsset(collAssets)
  const hasOneDominantCollAsset = dominantCollAsset !== undefined

  if (hasOneDebtAsset && hasOneDominantCollAsset) {
    return {
      chainId,
      protocolId,
      debtAsset: debtAssets[0],
      collateralAsset: dominantCollAsset,
    }
  }
  return undefined
}
