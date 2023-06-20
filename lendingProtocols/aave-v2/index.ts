import BigNumber from 'bignumber.js'
import * as blockchainCalls from 'blockchain/aave'
import { AaveReserveConfigurationDataParams, AaveServices } from 'lendingProtocols/aaveCommon'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'
import { makeObservable, makeOneObservable } from 'lendingProtocols/pipelines'
import { memoize } from 'lodash'
import { Observable } from 'rxjs'

import * as pipelines from './pipelines'
import curry from 'ramda/src/curry'

interface AaveV2ServicesDependencies {
  refresh$: Observable<unknown>
}

export function getAaveV2Services({ refresh$ }: AaveV2ServicesDependencies): AaveServices {
  const aaveLiquidations$ = makeObservable(refresh$, blockchainCalls.getAaveV2PositionLiquidation)
  const aaveUserAccountData$ = makeObservable(refresh$, pipelines.mapAaveUserAccountData)
  const getAaveReserveData$ = makeObservable(refresh$, blockchainCalls.getAaveV2ReserveData)
  const tokenPrices = makeObservable(refresh$, blockchainCalls.getAaveV2AssetsPrices)
  const tokenPriceInEth$ = makeObservable(refresh$, blockchainCalls.getAaveV2OracleAssetPrice)
  const usdcPriceInEth$ = tokenPriceInEth$({ token: 'USDC' })
  const aaveUserReserveData$ = makeObservable(refresh$, blockchainCalls.getAaveV2UserReserveData)
  const aaveReserveConfigurationData$ = makeObservable(
    refresh$,
    blockchainCalls.getAaveV2ReserveConfigurationData,
  )
  const aaveUserConfiguration$ = makeObservable(
    refresh$,
    blockchainCalls.getAaveV2UserConfiguration,
  )
  const aaveReservesList$ = makeOneObservable(refresh$, blockchainCalls.getAaveV2ReservesList)

  const getAaveOnChainPosition$ = makeObservable(refresh$, pipelines.aaveV2OnChainPosition)

  const aaveAvailableLiquidityInUSDC$: (
    args: blockchainCalls.AaveV2ReserveDataParameters,
  ) => Observable<BigNumber> = memoize(
    curry(pipelines.aaveAvailableLiquidityInUSDC$)(
      getAaveReserveData$,
      tokenPriceInEth$,
      usdcPriceInEth$,
    ),
    ({ token }) => token,
  )

  const aaveProtocolData$ = memoize(
    curry(pipelines.getAaveProtocolData$)(
      aaveUserReserveData$,
      aaveUserAccountData$,
      tokenPriceInEth$,
      aaveUserConfiguration$,
      aaveReservesList$,
      getAaveOnChainPosition$,
    ),
    (collateralToken, debtToken, proxyAddress) => `${collateralToken}-${debtToken}-${proxyAddress}`,
  )

  const aaveProxyConfiguration$ = memoize(
    curry(pipelines.getAaveProxyConfiguration$)(aaveUserConfiguration$, aaveReservesList$),
  )

  const wrapAaveReserveData$ = ({ collateralToken }: AaveReserveConfigurationDataParams) => {
    return aaveReserveConfigurationData$({ token: collateralToken })
  }

  return {
    protocol: LendingProtocol.AaveV2,
    aaveReserveConfigurationData$: wrapAaveReserveData$,
    getAaveReserveData$,
    aaveAvailableLiquidityInUSDC$,
    aaveLiquidations$,
    aaveUserAccountData$,
    aaveProxyConfiguration$,
    aaveProtocolData$,
    aaveOracleAssetPriceData$: tokenPriceInEth$,
    getAaveAssetsPrices$: tokenPrices,
  }
}
