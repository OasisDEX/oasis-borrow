import BigNumber from 'bignumber.js'
import mainnet from 'blockchain/addresses/mainnet.json'

const reserveNamesDictionary = Object.fromEntries(
  Object.entries(mainnet).map((mainnetEntry) => mainnetEntry.reverse()),
)

type AaveUserConfigurationResult = {
  collateral: boolean
  borrowed: boolean
  asset: string
  assetName: typeof mainnet[keyof typeof mainnet]
}

export function createAaveUserConfiguration(
  aaveUserConfiguration?: string[],
  aaveReserveList?: string[],
): AaveUserConfigurationResult[] {
  // https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool#getuserconfiguration
  if (!aaveUserConfiguration?.length || !aaveReserveList?.length) return []

  return (
    String(new BigNumber(aaveUserConfiguration[0]).toString(2))
      .match(/.{1,2}/g)
      ?.reverse() // reverse, cause we need to start from the end
      .map(
        (
          [collateral, borrowed],
          reserveIndex, // collateral, borrowed are string '0' or '1'
        ) =>
          reserveNamesDictionary[aaveReserveList[reserveIndex]] && {
            collateral: !!Number(collateral),
            borrowed: !!Number(borrowed),
            asset: aaveReserveList[reserveIndex],
            assetName: reserveNamesDictionary[aaveReserveList[reserveIndex]],
          },
      )
      .filter(Boolean) || []
  )
}

export function hasOtherAssets(
  userAssetList: AaveUserConfigurationResult[],
  assetsToCheck: AaveUserConfigurationResult['assetName'][],
) {
  return Array.isArray(userAssetList) && Array.isArray(assetsToCheck)
    ? userAssetList
        .filter((asset) => asset.borrowed || asset.collateral)
        .filter((asset) => !assetsToCheck.includes(asset.assetName)).length > 0
    : false
}
