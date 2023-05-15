import * as blockchainCalls from 'blockchain/aave-v3'
import { NetworkIds } from 'blockchain/networkIds'
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
  networkId: NetworkIds.MAINNET
}

export function getAaveV3Services({
  refresh$,
  networkId,
}: AaveV3ServicesDependencies): AaveServices {
  const assetsPrices$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3AssetsPrices,
    networkId,
  )
  const assetPrice$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3OracleAssetPrice,
    networkId,
  )

  const aaveReserveConfigurationData$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3ReserveConfigurationData,
    networkId,
  )

  const getAaveV3EModeCategoryForAsset$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3EModeCategoryForAsset,
    networkId,
  )

  const aaveLiquidations$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3PositionLiquidation,
    networkId,
  )

  const aaveUserAccountData$: (args: UserAccountDataArgs) => Observable<UserAccountData> =
    makeObservableForNetworkId(
      refresh$,
      curry(mapAaveUserAccountData$)(blockchainCalls.getAaveV3UserAccountData),
      networkId,
    )

  const getAaveReserveData$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3ReserveData,
    networkId,
  )

  const getEModeCategoryData$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getEModeCategoryData,
    networkId,
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
  )
  const aaveUserConfiguration$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3UserConfigurations,
    networkId,
  )
  const aaveReservesList$ = makeObservableForNetworkId(
    refresh$,
    blockchainCalls.getAaveV3ReservesList,
    networkId,
  )({})

  const onChainPosition$ = makeObservableForNetworkId(refresh$, aaveV3OnChainPosition, networkId)

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
    (args: { token: string }) => args.token,
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
