import type { SparkV3SupportedNetwork } from 'blockchain/spark-v3'
import * as blockchainCalls from 'blockchain/spark-v3'
import type {
  AaveLikeUserAccountData,
  AaveLikeUserAccountDataArgs,
} from 'lendingProtocols/aave-like-common'
import type { AaveLikeServices } from 'lendingProtocols/aave-like-common/aave-like-services'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'
import { makeObservableForNetworkId } from 'lendingProtocols/pipelines'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import type { Observable } from 'rxjs'

import {
  getReserveConfigurationDataWithEMode$,
  getSparkProtocolData$,
  getSparkProxyConfiguration$,
  mapSparkUserAccountData$,
  prepareSparkAvailableLiquidityInUSDC$,
  sparkV3OnChainPosition,
} from './pipelines'

interface SparkV3ServicesDependencies {
  refresh$: Observable<unknown>
  networkId: SparkV3SupportedNetwork
}

export function getSparkV3Services({
  refresh$,
  networkId,
}: SparkV3ServicesDependencies): AaveLikeServices {
  const assetsPrices$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getSparkV3AssetsPrices,
    networkId,
    'assetsPrices$',
  )
  const assetPrice$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getSparkV3OracleAssetPrice,
    networkId,
    'assetPrice$',
  )

  const aaveLikeReserveConfigurationData$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getSparkV3ReserveConfigurationData,
    networkId,
    'aaveLikeReserveConfigurationData$',
  )

  const getAaveV3EModeCategoryForAsset$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getSparkV3EModeCategoryForAsset,
    networkId,
    'getAaveV3EModeCategoryForAsset$',
  )

  const aaveLikeLiquidations$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getSparkV3PositionLiquidation,
    networkId,
    'aaveLikeLiquidations$',
  )

  const aaveLikeUserAccountData$: (
    args: AaveLikeUserAccountDataArgs,
  ) => Observable<AaveLikeUserAccountData> = makeObservableForNetworkId(
    refresh$,
    curry(mapSparkUserAccountData$)(blockchainCalls.getSparkV3UserAccountData),
    networkId,
    'aaveLikeUserAccountData$',
  )

  const getAaveLikeReserveData$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getSparkV3ReserveData,
    networkId,
    'getAaveLikeReserveData$',
  )

  const getEModeCategoryData$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getEModeCategoryData,
    networkId,
    'getEModeCategoryData$',
  )

  const aaveLikeAvailableLiquidityInUSDC$ = memoize(
    curry(prepareSparkAvailableLiquidityInUSDC$)(
      getAaveLikeReserveData$,
      assetPrice$({ token: 'WETH' }),
    ),
    ({ token }) => token,
  )

  const aaveUserReserveData$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getSparkV3UserReserveData,
    networkId,
    'aaveUserReserveData$',
  )
  const aaveUserConfiguration$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getSparkV3UserConfigurations,
    networkId,
    'aaveUserConfiguration$',
  )
  const aaveReservesList$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getSparkV3ReservesList,
    networkId,
    'aaveReservesList$',
  )({})

  const onChainPosition$ = makeObservableForNetworkId(
    refresh$,
    sparkV3OnChainPosition,
    networkId,
    'onChainPosition$',
  )

  const aaveLikeProtocolData$ = memoize(
    curry(getSparkProtocolData$)(
      aaveUserReserveData$,
      aaveLikeUserAccountData$,
      assetPrice$,
      aaveUserConfiguration$,
      aaveReservesList$,
      onChainPosition$,
    ),
    (collateralToken, debtToken, proxyAddress) => `${collateralToken}-${debtToken}-${proxyAddress}`,
  )

  const aaveLikeProxyConfiguration$ = memoize(
    curry(getSparkProxyConfiguration$)(aaveUserConfiguration$, aaveReservesList$),
  )

  const reserveConfigurationDataWithEMode$ = memoize(
    curry(getReserveConfigurationDataWithEMode$)(
      aaveLikeReserveConfigurationData$,
      getAaveV3EModeCategoryForAsset$,
      getEModeCategoryData$,
    ),
    (args: { collateralToken: string; debtToken: string }) =>
      `${args.collateralToken}-${args.debtToken}`,
  )

  return {
    protocol: LendingProtocol.SparkV3,
    aaveLikeReserveConfigurationData$: reserveConfigurationDataWithEMode$,
    getAaveLikeReserveData$,
    aaveLikeAvailableLiquidityInUSDC$,
    aaveLikeLiquidations$,
    aaveLikeUserAccountData$,
    aaveLikeProxyConfiguration$,
    aaveLikeProtocolData$,
    aaveLikeOracleAssetPriceData$: assetPrice$,
    getAaveLikeAssetsPrices$: assetsPrices$,
  }
}
