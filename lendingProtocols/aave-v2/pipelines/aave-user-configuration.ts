import { ADDRESSES } from '@oasisdex/addresses'
import BigNumber from 'bignumber.js'
import type { AaveV2UserConfigurationsParameters } from 'blockchain/aave'
import { curry } from 'ramda'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

const { mainnet } = ADDRESSES

const reserveNamesDictionary = Object.fromEntries(
  Object.entries(mainnet.common)
    .map((entry) => [entry[0], entry[1].toLowerCase()])
    .map((mainnetEntry) => mainnetEntry.reverse()),
)

export type AaveUserConfigurationResult = {
  collateral: boolean
  borrowed: boolean
  asset: string
  assetName: (typeof mainnet.common)[keyof typeof mainnet.common]
}

export type AaveUserConfigurationResults = AaveUserConfigurationResult[] & {
  hasAssets: (
    collateralToken: AaveUserConfigurationResult['assetName'][],
    debtToken: AaveUserConfigurationResult['assetName'][],
  ) => boolean
}

export function getAaveProxyConfiguration$(
  userConfiguration: (args: AaveV2UserConfigurationsParameters) => Observable<string[]>,
  reserveList: Observable<string[]>,
  proxyAddress: string,
): Observable<AaveUserConfigurationResults> {
  return combineLatest(userConfiguration({ address: proxyAddress }), reserveList).pipe(
    map(([aaveUserConfiguration, aaveReserveList]) =>
      createAaveUserConfiguration(aaveUserConfiguration, aaveReserveList),
    ),
  )
}

export function createAaveUserConfiguration(
  aaveUserConfiguration?: string[],
  aaveReserveList?: string[],
  tokensDictionary: any = reserveNamesDictionary,
): AaveUserConfigurationResults {
  // merges getreserveslist and getuserconfiguration
  if (!aaveUserConfiguration?.length || !aaveReserveList?.length)
    return Object.assign([], { hasAssets: () => false })

  // https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool#getuserconfiguration
  let binaryString = String(new BigNumber(aaveUserConfiguration[0]).toString(2))

  // aave does not pad this binary string
  while (binaryString.length < aaveReserveList.length * 2) {
    binaryString = '0' + binaryString
  }

  const results: AaveUserConfigurationResult[] =
    binaryString
      .match(/.{1,2}/g)
      ?.reverse() // reverse, cause we need to start from the end
      .map(
        (
          [collateral, borrowed],
          reserveIndex, // collateral, borrowed are string '0' or '1'
        ) =>
          tokensDictionary[aaveReserveList[reserveIndex].toLowerCase()] && {
            collateral: !!Number(collateral),
            borrowed: !!Number(borrowed),
            asset: aaveReserveList[reserveIndex],
            assetName: tokensDictionary[aaveReserveList[reserveIndex].toLowerCase()],
          },
      )
      .filter(Boolean) || []

  return Object.assign(results, { hasAssets: curry(hasAssets)(results) })
}

export function hasAssets(
  userAssetList: AaveUserConfigurationResult[],
  collateralToken: AaveUserConfigurationResult['assetName'][],
  debtToken: AaveUserConfigurationResult['assetName'][],
) {
  return userAssetList.filter(
    ({ collateral, assetName }) => collateral && collateralToken.includes(assetName),
  ).length > 0 &&
    // a special case for old positions with no debt, if theres no debt we should still return true
    // the empty array for STETH/ETH is a special case here (no issues there because its the only aave v2 pair using DS proxy)
    // look for getStrategyConfig$ for usage
    debtToken.length > 0
    ? userAssetList.filter(({ borrowed, assetName }) => borrowed && debtToken.includes(assetName))
        .length > 0
    : true
}
