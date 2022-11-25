import BigNumber from 'bignumber.js'
import mainnet from 'blockchain/addresses/mainnet.json'

const reserveNamesDictionary = Object.fromEntries(
  Object.entries(mainnet).map((mainnetEntry) => mainnetEntry.reverse()),
)

export type AaveUserConfigurationResult = {
  collateral: boolean
  borrowed: boolean
  asset: string
  assetName: typeof mainnet[keyof typeof mainnet]
}

export function createAaveUserConfiguration(
  aaveUserConfiguration?: string[],
  aaveReserveList?: string[],
  tokensDictionary: any = reserveNamesDictionary,
): AaveUserConfigurationResult[] {
  // merges getreserveslist and getuserconfiguration
  if (!aaveUserConfiguration?.length || !aaveReserveList?.length) return []

  // https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool#getuserconfiguration
  let binaryString = String(new BigNumber(aaveUserConfiguration[0]).toString(2))

  // aave does not pad this binary string
  while (binaryString.length < aaveReserveList.length * 2) {
    binaryString = '0' + binaryString
  }

  return (
    binaryString
      .match(/.{1,2}/g)
      ?.reverse() // reverse, cause we need to start from the end
      .map(
        (
          [collateral, borrowed],
          reserveIndex, // collateral, borrowed are string '0' or '1'
        ) =>
          tokensDictionary[aaveReserveList[reserveIndex]] && {
            collateral: !!Number(collateral),
            borrowed: !!Number(borrowed),
            asset: aaveReserveList[reserveIndex],
            assetName: tokensDictionary[aaveReserveList[reserveIndex]],
          },
      )
      .filter(Boolean) || []
  )
}

export function hasAssets(
  userAssetList: AaveUserConfigurationResult[],
  collateralToken: AaveUserConfigurationResult['assetName'],
  debtToken: AaveUserConfigurationResult['assetName'],
) {
  return (
    userAssetList.filter(({ collateral, assetName }) => collateral && assetName === collateralToken)
      .length > 0 &&
    userAssetList.filter(({ borrowed, assetName }) => borrowed && assetName === debtToken).length >
      0
  )
}
