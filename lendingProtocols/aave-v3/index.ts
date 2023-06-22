import * as blockchainCalls from 'blockchain/aave-v3'
import { AaveV3SupportedNetwork } from 'blockchain/aave-v3'
import { UserAccountData, UserAccountDataArgs } from 'lendingProtocols/aaveCommon'
import { AaveServices } from 'lendingProtocols/aaveCommon/AaveServices'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'
import { makeObservableForNetworkId } from 'lendingProtocols/pipelines'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import { Observable } from 'rxjs'

import {
  aaveV3OnChainPosition,
  getAaveProtocolData$,
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
}: AaveV3ServicesDependencies): AaveServices {
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

  const aaveReserveConfigurationData$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3ReserveConfigurationData,
    networkId,
    'aaveReserveConfigurationData$',
  )

  const getAaveV3EModeCategoryForAsset$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3EModeCategoryForAsset,
    networkId,
    'getAaveV3EModeCategoryForAsset$',
  )

  const aaveLiquidations$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3PositionLiquidation,
    networkId,
    'aaveLiquidations$',
  )

  const aaveUserAccountData$: (args: UserAccountDataArgs) => Observable<UserAccountData> =
    makeObservableForNetworkId(
      refresh$,
      curry(mapAaveUserAccountData$)(blockchainCalls.getAaveV3UserAccountData),
      networkId,
      'aaveUserAccountData$',
    )

  const getAaveReserveData$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3ReserveData,
    networkId,
    'getAaveReserveData$',
  )

  const getEModeCategoryData$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getEModeCategoryData,
    networkId,
    'getEModeCategoryData$',
  )

  const aaveAvailableLiquidityInUSDC$ = memoize(
    curry(prepareaaveAvailableLiquidityInUSDC$)(
      getAaveReserveData$,
      assetPrice$({ token: 'WETH' }),
    ),
    ({ token }) => token,
  )

  const aaveUserReserveData$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3UserReserveData,
    networkId,
    'aaveUserReserveData$',
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

  const onChainPosition$ = makeObservableForNetworkId(
    refresh$,
    aaveV3OnChainPosition,
    networkId,
    'onChainPosition$',
  )

  const aaveProtocolData$ = memoize(
    curry(getAaveProtocolData$)(
      aaveUserReserveData$,
      aaveUserAccountData$,
      assetPrice$,
      aaveUserConfiguration$,
      aaveReservesList$,
      onChainPosition$,
    ),
    (collateralToken, debtToken, proxyAddress) => `${collateralToken}-${debtToken}-${proxyAddress}`,
  )

  const aaveProxyConfiguration$ = memoize(
    curry(getAaveProxyConfiguration$)(aaveUserConfiguration$, aaveReservesList$),
  )

  const reserveConfigurationDataWithEMode$ = memoize(
    curry(getReserveConfigurationDataWithEMode$)(
      aaveReserveConfigurationData$,
      getAaveV3EModeCategoryForAsset$,
      getEModeCategoryData$,
    ),
    (args: { collateralToken: string; debtToken: string }) =>
      `${args.collateralToken}-${args.debtToken}`,
  )

  return {
    protocol: LendingProtocol.AaveV3,
    aaveReserveConfigurationData$: reserveConfigurationDataWithEMode$,
    getAaveReserveData$,
    aaveAvailableLiquidityInUSDC$,
    aaveLiquidations$,
    aaveUserAccountData$,
    aaveProxyConfiguration$,
    aaveProtocolData$,
    aaveOracleAssetPriceData$: assetPrice$,
    getAaveAssetsPrices$: assetsPrices$,
  }
}
