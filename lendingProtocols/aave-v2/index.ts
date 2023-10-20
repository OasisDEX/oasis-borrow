import type BigNumber from 'bignumber.js'
import * as blockchainCalls from 'blockchain/aave'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import type {
  AaveLikeReserveConfigurationDataParams,
  AaveLikeReserveData,
  AaveLikeServices,
} from 'lendingProtocols/aave-like-common'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'
import { makeObservable, makeOneObservable } from 'lendingProtocols/pipelines'
import { memoize } from 'lodash'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

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
  const aaveLikeReserveConfigurationData$ = makeObservable(
    refresh$,
    blockchainCalls.getAaveV2ReserveConfigurationData,
  )
  const aaveUserConfiguration$ = makeObservable(
    refresh$,
    blockchainCalls.getAaveV2UserConfiguration,
  )
  const aaveReservesList$ = makeOneObservable(refresh$, blockchainCalls.getAaveV2ReservesList)

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

  const reserveDataWithMissingCaps$ = memoize(
    (args: { token: string }): Observable<AaveLikeReserveData> => {
      return getAaveLikeReserveData$(args).pipe(
        map((reserveData) => {
          return {
            ...reserveData,
            // I set the max values because it doesn't change anything in the UI. I set proper values for Aave v3 and Spark.
            caps: {
              borrow: maxUint256,
              supply: maxUint256,
            },
            totalDebt: maxUint256,
            totalSupply: maxUint256,
            availableToBorrow: maxUint256,
            availableToSupply: maxUint256,
          }
        }),
      )
    },
    (args: { token: string }) => args.token,
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
    getAaveLikeReserveData$: reserveDataWithMissingCaps$,
    aaveLikeAvailableLiquidityInUSDC$,
    aaveLikeLiquidations$,
    aaveLikeUserAccountData$,
    aaveLikeProxyConfiguration$,
    aaveLikeOracleAssetPriceData$: tokenPriceInEth$,
    getAaveLikeAssetsPrices$: tokenPrices,
  }
}
