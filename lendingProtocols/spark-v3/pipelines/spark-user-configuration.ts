import { ADDRESSES } from '@oasisdex/addresses'
import BigNumber from 'bignumber.js'
import type { SparkV3UserConfigurationsParameters } from 'blockchain/spark-v3'
import { curry } from 'ramda'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

const { mainnet } = ADDRESSES

const reserveNamesDictionary = Object.fromEntries(
  Object.entries(mainnet.common).map((mainnetEntry) => mainnetEntry.reverse()),
)

export type SparkUserConfigurationResult = {
  collateral: boolean
  borrowed: boolean
  asset: string
  assetName: (typeof mainnet.common)[keyof typeof mainnet.common]
}

export type SparkUserConfigurationResults = SparkUserConfigurationResult[] & {
  hasAssets: (
    collateralToken: SparkUserConfigurationResult['assetName'][],
    debtToken: SparkUserConfigurationResult['assetName'][],
  ) => boolean
}

export function getSparkProxyConfiguration$(
  userConfiguration: (
    args: Omit<SparkV3UserConfigurationsParameters, 'networkId'>,
  ) => Observable<string[]>,
  reserveList: Observable<string[]>,
  proxyAddress: string,
): Observable<SparkUserConfigurationResults> {
  return combineLatest(userConfiguration({ address: proxyAddress }), reserveList).pipe(
    map(([sparkUserConfiguration, sparkReserveList]) =>
      createSparkUserConfiguration(sparkUserConfiguration, sparkReserveList),
    ),
  )
}

export function createSparkUserConfiguration(
  sparkUserConfiguration?: string[],
  sparkReserveList?: string[],
  tokensDictionary: any = reserveNamesDictionary,
): SparkUserConfigurationResults {
  // merges getreserveslist and getuserconfiguration
  if (!sparkUserConfiguration?.length || !sparkReserveList?.length)
    return Object.assign([], { hasAssets: () => false })

  let binaryString = String(new BigNumber(sparkUserConfiguration[0]).toString(2))

  while (binaryString.length < sparkReserveList.length * 2) {
    binaryString = '0' + binaryString
  }

  const results: SparkUserConfigurationResult[] =
    binaryString
      .match(/.{1,2}/g)
      ?.reverse() // reverse, cause we need to start from the end
      .map(
        (
          [collateral, borrowed],
          reserveIndex, // collateral, borrowed are string '0' or '1'
        ) =>
          tokensDictionary[sparkReserveList[reserveIndex]] && {
            collateral: !!Number(collateral),
            borrowed: !!Number(borrowed),
            asset: sparkReserveList[reserveIndex],
            assetName: tokensDictionary[sparkReserveList[reserveIndex]],
          },
      )
      .filter(Boolean) || []

  return Object.assign(results, { hasAssets: curry(hasAssets)(results) })
}

export function hasAssets(
  userAssetList: SparkUserConfigurationResult[],
  collateralToken: SparkUserConfigurationResult['assetName'][],
  debtToken: SparkUserConfigurationResult['assetName'][],
) {
  return (
    userAssetList.filter(
      ({ collateral, assetName }) => collateral && collateralToken.includes(assetName),
    ).length > 0 &&
    userAssetList.filter(({ borrowed, assetName }) => borrowed && debtToken.includes(assetName))
      .length > 0
  )
}
