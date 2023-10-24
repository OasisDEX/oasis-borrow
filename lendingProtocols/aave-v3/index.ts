import type { AaveV3SupportedNetwork } from 'blockchain/aave-v3'
import * as blockchainCalls from 'blockchain/aave-v3'
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
  getAaveProxyConfiguration$,
  getReserveConfigurationDataWithEMode$,
  mapAaveUserAccountData$,
  prepareaaveAvailableLiquidityInUSDC$,
} from './pipelines'

interface AaveV3ServicesDependencies {
  refresh$: Observable<unknown>
  networkId: AaveV3SupportedNetwork
}

export function getAaveV3Services({
  refresh$,
  networkId,
}: AaveV3ServicesDependencies): AaveLikeServices {
  const assetsPrices$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3AssetsPrices,
    networkId,
    'assetsPrices$',
  )
  const assetPrice$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3OracleAssetPrice,
    networkId,
    'assetPrice$',
  )

  const aaveLikeReserveConfigurationData$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3ReserveConfigurationData,
    networkId,
    'aaveLikeReserveConfigurationData$',
  )

  const getAaveV3EModeCategoryForAsset$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3EModeCategoryForAsset,
    networkId,
    'getAaveV3EModeCategoryForAsset$',
  )

  const aaveLikeLiquidations$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3PositionLiquidation,
    networkId,
    'aaveLikeLiquidations$',
  )

  const aaveLikeUserAccountData$: (
    args: AaveLikeUserAccountDataArgs,
  ) => Observable<AaveLikeUserAccountData> = makeObservableForNetworkId(
    refresh$,
    curry(mapAaveUserAccountData$)(blockchainCalls.getAaveV3UserAccountData),
    networkId,
    'aaveLikeUserAccountData$',
  )

  const getAaveLikeReserveData$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3ReserveData,
    networkId,
    'getAaveLikeReserveData$',
  )

  const getReserveCaps$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3ReserveCaps,
    networkId,
    'getReserveCaps$',
  )

  const getEModeCategoryData$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getEModeCategoryData,
    networkId,
    'getEModeCategoryData$',
  )

  const aaveLikeAvailableLiquidityInUSDC$ = memoize(
    curry(prepareaaveAvailableLiquidityInUSDC$)(
      getAaveLikeReserveData$,
      assetPrice$({ token: 'WETH' }),
    ),
    ({ token }) => token,
  )

  const aaveUserConfiguration$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3UserConfigurations,
    networkId,
    'aaveUserConfiguration$',
  )
  const aaveReservesList$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3ReservesList,
    networkId,
    'aaveReservesList$',
  )({})

  const reserveDataWithCaps$ = memoize(
    curry(getAaveLikeReserveData)(getAaveLikeReserveData$, getReserveCaps$),
    (args: { token: string }) => args.token,
  )

  const aaveLikeProxyConfiguration$ = memoize(
    curry(getAaveProxyConfiguration$)(aaveUserConfiguration$, aaveReservesList$),
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
    protocol: LendingProtocol.AaveV3,
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
