import { getOnChainPosition } from 'actions/aave/oasisActionsLibWrapper'
import BigNumber from 'bignumber.js'
import {
  createAaveV2OracleAssetPriceData$,
  createConvertToAaveV2OracleAssetPrice$,
  getAaveV2AssetsPrices,
  getAaveV2PositionLiquidation$,
  getAaveV2ReserveConfigurationData,
  getAaveV2ReserveData,
  getAaveV2ReservesList,
  getAaveV2UserAccountData,
  getAaveV2UserConfiguration,
  getAaveV2UserReserveData,
} from 'blockchain/aave'
import { observe } from 'blockchain/calls/observe'
import { Context } from 'blockchain/network'
import { AaveServices } from 'lendingProtocols/aaveCommon/AaveServices'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'
import { isEqual, memoize } from 'lodash'
import { from, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import {
  getAaveProtocolData$,
  getAaveProxyConfiguration$,
  mapAaveUserAccountData$,
  prepareAaveAvailableLiquidityInUSDC$,
} from './pipelines'
import curry from 'ramda/src/curry'

interface AaveV2ServicesDependencies {
  context$: Observable<Context>
  refresh$: Observable<unknown>
  once$: Observable<unknown>
}
export function getAaveV2Services({
  context$,
  refresh$,
  once$,
}: AaveV2ServicesDependencies): AaveServices {
  const aaveLiquidations$ = memoize(
    curry(getAaveV2PositionLiquidation$)(context$),
    (proxyAddress) => proxyAddress,
  )

  const aaveV2UserAccountData$ = observe(
    refresh$,
    context$,
    getAaveV2UserAccountData,
    (args) => args.address,
  )

  const aaveUserAccountData$ = memoize(
    curry(mapAaveUserAccountData$)(aaveV2UserAccountData$),
    (args) => JSON.stringify(args),
  )

  const getAaveReserveData$ = observe(once$, context$, getAaveV2ReserveData)
  const getAaveAssetsPrices$ = observe(once$, context$, getAaveV2AssetsPrices)

  const tokenPriceInEth$ = memoize((token: string) => {
    return getAaveAssetsPrices$({ tokens: [token] }).pipe(
      map(([tokenPriceInEth]) => tokenPriceInEth),
      distinctUntilChanged((a, b) => isEqual(a, b)),
    )
  })

  const usdcPriceInEth$ = tokenPriceInEth$('USDC')

  const aaveAvailableLiquidityInUSDC$ = memoize(
    curry(prepareAaveAvailableLiquidityInUSDC$)(
      getAaveReserveData$,
      tokenPriceInEth$,
      usdcPriceInEth$,
    ),
    ({ token }) => token,
  )

  const aaveUserReserveData$ = observe(refresh$, context$, getAaveV2UserReserveData)
  const aaveUserConfiguration$ = observe(refresh$, context$, getAaveV2UserConfiguration)
  const aaveReservesList$ = observe(refresh$, context$, getAaveV2ReservesList)()
  const aaveOracleAssetPriceData$: ({ token }: { token: string }) => Observable<BigNumber> =
    memoize(curry(createAaveV2OracleAssetPriceData$)(refresh$, context$), ({ token }) => token)

  const getAaveOnChainPosition$ = memoize(
    (collateralToken: string, debtToken: string, proxyAddress: string) => {
      return context$.pipe(
        switchMap((context) => {
          return from(
            getOnChainPosition({
              context,
              proxyAddress,
              collateralToken,
              debtToken,
              protocol: LendingProtocol.AaveV2,
            }),
          )
        }),
        shareReplay(1),
      )
    },
    (collateralToken: string, debtToken: string, proxyAddress: string) =>
      collateralToken + debtToken + proxyAddress,
  )

  const aaveProtocolData$ = memoize(
    curry(getAaveProtocolData$)(
      aaveUserReserveData$,
      aaveUserAccountData$,
      aaveOracleAssetPriceData$,
      aaveUserConfiguration$,
      aaveReservesList$,
      getAaveOnChainPosition$,
    ),
    (collateralToken, debtToken, proxyAddress) => `${collateralToken}-${debtToken}-${proxyAddress}`,
  )

  const aaveProxyConfiguration$ = memoize(
    curry(getAaveProxyConfiguration$)(aaveUserConfiguration$, aaveReservesList$),
  )

  const aaveReserveConfigurationData$ = observe(
    refresh$,
    context$,
    getAaveV2ReserveConfigurationData,
    ({ token }) => token,
  )

  const convertToAaveOracleAssetPrice$ = memoize(
    curry(createConvertToAaveV2OracleAssetPrice$)(aaveOracleAssetPriceData$),
    (args: { token: string; amount: BigNumber }) => args.token + args.amount.toString(),
  )

  return {
    protocol: LendingProtocol.AaveV2,
    aaveLiquidations$,
    aaveUserAccountData$,
    aaveAvailableLiquidityInUSDC$,
    aaveProtocolData$,
    aaveProxyConfiguration$,
    getAaveAssetsPrices$,
    aaveReserveConfigurationData$,
    convertToAaveOracleAssetPrice$,
    aaveOracleAssetPriceData$,
    getAaveReserveData$,
  }
}
