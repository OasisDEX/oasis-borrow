import { PortfolioMigrationAsset } from 'shared/domain-types'

export function getDominantCollAsset(collAssets: PortfolioMigrationAsset[]) {
  const DOMINANT_THRESHOLD = 1n

  const sortedAssets = collAssets.slice().sort((a, b) => {
    return Number(b.usdValue - a.usdValue)
  })
  const dominantCollAsset = sortedAssets.shift()
  if (dominantCollAsset == null) {
    return undefined
  }

  let result: undefined | PortfolioMigrationAsset = dominantCollAsset
  // check if any other collAssets has usdValue value greater than dust 1% of dominantCollAsset
  for (let asset of sortedAssets) {
    if (asset.usdValue > (dominantCollAsset.usdValue * DOMINANT_THRESHOLD) / 100n) {
      result = undefined
    }
  }

  return result
}
