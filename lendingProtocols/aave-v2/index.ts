import type BigNumber from 'bignumber.js'
import * as blockchainCalls from 'blockchain/aave'
import type {
  AaveLikeReserveConfigurationDataParams,
  AaveLikeServices,
} from 'lendingProtocols/aave-like-common'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'
import { makeObservable, makeOneObservable } from 'lendingProtocols/pipelines'
import { memoize } from 'lodash'
import type { Observable } from 'rxjs'

import * as pipelines from './pipelines'
import curry from 'ramda/src/curry'

interface AaveV2ServicesDependencies {
  refresh$: Observable<unknown>
}

export function getAaveV2Services({ refresh$ }: AaveV2ServicesDependencies): AaveLikeServices {
  const aaveLikeLiquidations$ = makeObservable(
    refresh$,
    blockchainCalls.getAaveV2PositionLiquidation,
  )
  const aaveLikeUserAccountData$ = makeObservable(refresh$, pipelines.mapAaveUserAccountData)
  const getAaveLikeReserveData$ = makeObservable(refresh$, blockchainCalls.getAaveV2ReserveData)
  const tokenPrices = makeObservable(refresh$, blockchainCalls.getAaveV2AssetsPrices)
  const tokenPriceInEth$ = makeObservable(refresh$, blockchainCalls.getAaveV2OracleAssetPrice)
  const usdcPriceInEth$ = tokenPriceInEth$({ token: 'USDC' })
  const aaveUserReserveData$ = makeObservable(refresh$, blockchainCalls.getAaveV2UserReserveData)
  const aaveLikeReserveConfigurationData$ = makeObservable(
    refresh$,
    blockchainCalls.getAaveV2ReserveConfigurationData,
  )
  const aaveUserConfiguration$ = makeObservable(
    refresh$,
    blockchainCalls.getAaveV2UserConfiguration,
  )
  const aaveReservesList$ = makeOneObservable(refresh$, blockchainCalls.getAaveV2ReservesList)

  const getAaveOnChainPosition$ = makeObservable(refresh$, pipelines.aaveV2OnChainPosition)

  const aaveLikeAvailableLiquidityInUSDC$: (
    args: blockchainCalls.AaveV2ReserveDataParameters,
  ) => Observable<BigNumber> = memoize(
    curry(pipelines.aaveLikeAvailableLiquidityInUSDC$)(
      getAaveLikeReserveData$,
      tokenPriceInEth$,
      usdcPriceInEth$,
    ),
    ({ token }) => token,
  )

  const aaveLikeProtocolData$ = memoize(
    curry(pipelines.getAaveProtocolData$)(
      aaveUserReserveData$,
      aaveLikeUserAccountData$,
      tokenPriceInEth$,
      aaveUserConfiguration$,
      aaveReservesList$,
      getAaveOnChainPosition$,
    ),
    (collateralToken, debtToken, proxyAddress) => `${collateralToken}-${debtToken}-${proxyAddress}`,
  )

  const aaveLikeProxyConfiguration$ = memoize(
    curry(pipelines.getAaveProxyConfiguration$)(aaveUserConfiguration$, aaveReservesList$),
  )

  const wrapAaveReserveData$ = ({ collateralToken }: AaveLikeReserveConfigurationDataParams) => {
    return aaveLikeReserveConfigurationData$({ token: collateralToken })
  }

  return {
    protocol: LendingProtocol.AaveV2,
    aaveLikeReserveConfigurationData$: wrapAaveReserveData$,
    getAaveLikeReserveData$,
    aaveLikeAvailableLiquidityInUSDC$,
    aaveLikeLiquidations$,
    aaveLikeUserAccountData$,
    aaveLikeProxyConfiguration$,
    aaveLikeProtocolData$,
    aaveLikeOracleAssetPriceData$: tokenPriceInEth$,
    getAaveLikeAssetsPrices$: tokenPrices,
  }
}
