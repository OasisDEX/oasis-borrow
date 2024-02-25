import type { SparkV3SupportedNetwork } from 'blockchain/spark-v3'
import * as blockchainCalls from 'blockchain/spark-v3'
import type {
  AaveLikeUserAccountData,
  AaveLikeUserAccountDataArgs,
} from 'lendingProtocols/aave-like-common'
import { getAaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import type { AaveLikeServices } from 'lendingProtocols/aave-like-common/aave-like-services'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'
import { makeObservableForNetworkId } from 'lendingProtocols/pipelines'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import type { Observable } from 'rxjs'

import {
  getReserveConfigurationDataWithEMode$,
  getSparkProxyConfiguration$,
  mapSparkUserAccountData$,
  prepareSparkAvailableLiquidityInUSDC$,
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

  const getReserveCaps$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getSparkV3ReserveCaps,
    networkId,
    'getReserveCaps$',
  )

  const getReserveTokenAddresses$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getSparkV3ReserveTokenAddresses,
    networkId,
    'getReserveTokenAddresses$',
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

  const reserveDataWithCaps$ = memoize(
    curry(getAaveLikeReserveData)(
      getAaveLikeReserveData$,
      getReserveCaps$,
      getReserveTokenAddresses$,
    ),
    (args: { token: string }) => args.token,
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
    getAaveLikeReserveData$: reserveDataWithCaps$,
    aaveLikeAvailableLiquidityInUSDC$,
    aaveLikeLiquidations$,
    aaveLikeUserAccountData$,
    aaveLikeProxyConfiguration$,
    aaveLikeOracleAssetPriceData$: assetPrice$,
    getAaveLikeAssetsPrices$: assetsPrices$,
  }
}
