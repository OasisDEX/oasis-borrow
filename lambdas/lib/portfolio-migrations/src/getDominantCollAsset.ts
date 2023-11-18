import { MigrationAsset } from 'shared/domain-types'

export function getDominantCollAsset(collAssets: MigrationAsset[]) {
  const DOMINANT_THRESHOLD = 0.01

  const sortedAssets = collAssets.slice().sort((a, b) => {
    return b.usdValue - a.usdValue
  })
  const dominantCollAsset = sortedAssets.shift()
  if (dominantCollAsset == null) {
    return undefined
  }

  let result: undefined | MigrationAsset = dominantCollAsset
  // check if any other collAssets has usdValue value greater than dust 1% of dominantCollAsset
  for (let asset of sortedAssets) {
    if (asset.usdValue > dominantCollAsset.usdValue * DOMINANT_THRESHOLD) {
      result = undefined
    }
  }

  return result
}
