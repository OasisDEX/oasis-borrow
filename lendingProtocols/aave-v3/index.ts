import { getOnChainPosition } from 'actions/aave/oasisActionsLibWrapper'
import { BigNumber } from 'bignumber.js'
import {
  createConvertToAaveV3OracleAssetPrice$,
  getAaveV3AssetsPrices,
  getAaveV3EModeCategoryForAsset,
  getAaveV3OracleAssetPriceData$,
  getAaveV3OracleBaseCurrencyUnit,
  getAaveV3PositionLiquidation$,
  getAaveV3ReserveConfigurationData,
  getAaveV3ReserveData,
  getAaveV3ReservesList,
  getAaveV3UserAccountData,
  getAaveV3UserConfiguration,
  getAaveV3UserReserveData,
  getEModeCategoryData,
} from 'blockchain/aave-v3'
import { observe } from 'blockchain/calls/observe'
import { Context } from 'blockchain/network'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import { from, Observable } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'

import {
  createAaveV3PrepareReserveData$,
  getAaveProtocolData$,
  getAaveProxyConfiguration$,
  getReserveConfigurationDataWithEMode$,
  prepareaaveAvailableLiquidityInUSDC$,
} from './pipelines'

interface AaveV3ServicesDependencies {
  context$: Observable<Context>
  refresh$: Observable<unknown>
  once$: Observable<unknown>
}

export function getAaveV3Services({ context$, refresh$, once$ }: AaveV3ServicesDependencies) {
  const aaveLiquidations$ = memoize(curry(getAaveV3PositionLiquidation$)(context$))

  const aaveUserAccountData$ = observe(
    refresh$,
    context$,
    getAaveV3UserAccountData,
    (args) => args.address,
  )
  const getAaveV3BaseCurrencyUnit$ = observe(once$, context$, getAaveV3OracleBaseCurrencyUnit)
  const getAaveReserveData$ = observe(once$, context$, getAaveV3ReserveData)
  const getAaveAssetsPrices$ = observe(once$, context$, getAaveV3AssetsPrices)

  const getAaveV3EModeCategoryForAsset$ = observe(once$, context$, getAaveV3EModeCategoryForAsset)
  const getEModeCategoryData$ = observe(once$, context$, getEModeCategoryData)

  const aaveAvailableLiquidityInUSDC$ = memoize(
    curry(prepareaaveAvailableLiquidityInUSDC$)(
      getAaveReserveData$,
      // @ts-expect-error
      getAaveAssetsPrices$({ tokens: ['WETH'] }), //this needs to be fixed in OasisDEX/transactions -> CallDef
      getAaveV3BaseCurrencyUnit$(),
    ),
    ({ token }) => token,
  )

  const aaveUserReserveData$ = observe(refresh$, context$, getAaveV3UserReserveData)
  const aaveUserConfiguration$ = observe(refresh$, context$, getAaveV3UserConfiguration)
  const aaveReservesList$ = observe(refresh$, context$, getAaveV3ReservesList)()
  const aaveOracleAssetPriceData$ = observe(
    refresh$,
    context$,
    getAaveV3OracleAssetPriceData$,
    ({ token }) => token,
  )

  const aaveOracleAssetPriceWithBaseCurrencyUnit$: ({
    token,
  }: {
    token: string
  }) => Observable<BigNumber> = memoize(
    ({ token }: { token: string }) => {
      return getAaveV3BaseCurrencyUnit$().pipe(
        switchMap((baseCurrencyUnit) => {
          return aaveOracleAssetPriceData$({ token, baseCurrencyUnit })
        }),
      )
    },
    ({ token }) => token,
  )

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
              protocol: LendingProtocol.AaveV3,
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
      aaveOracleAssetPriceWithBaseCurrencyUnit$,
      aaveUserConfiguration$,
      aaveReservesList$,
      getAaveOnChainPosition$,
    ),
    (collateralToken, debtToken, proxyAddress) => `${collateralToken}-${debtToken}-${proxyAddress}`,
  )

  const aaveProxyConfiguration$ = memoize(
    curry(getAaveProxyConfiguration$)(aaveUserConfiguration$, aaveReservesList$),
  )

  const wrappedGetAaveReserveData$ = memoize(
    curry(createAaveV3PrepareReserveData$)(
      observe(refresh$, context$, getAaveV3ReserveData, (args) => args.token),
    ),
  )

  const aaveReserveConfigurationData$ = observe(
    refresh$,
    context$,
    getAaveV3ReserveConfigurationData,
    ({ token }) => token,
  )

  const reserveConfigurationDataWithEMode$ = memoize(
    curry(getReserveConfigurationDataWithEMode$)(
      aaveReserveConfigurationData$,
      getAaveV3EModeCategoryForAsset$,
      getEModeCategoryData$,
    ),
    (args: { token: string }) => args.token,
  )

  const convertToAaveOracleAssetPrice$ = memoize(
    curry(createConvertToAaveV3OracleAssetPrice$)(aaveOracleAssetPriceWithBaseCurrencyUnit$),
    (args: { token: string }) => args.token,
  )

  return {
    protocol: LendingProtocol.AaveV3,
    aaveLiquidations$,
    aaveUserAccountData$,
    aaveAvailableLiquidityInUSDC$,
    aaveProtocolData$,
    aaveProxyConfiguration$,
    wrappedGetAaveReserveData$,
    getAaveAssetsPrices$,
    aaveReserveConfigurationData$: reserveConfigurationDataWithEMode$,
    convertToAaveOracleAssetPrice$,
    aaveOracleAssetPriceData$: aaveOracleAssetPriceWithBaseCurrencyUnit$,
    getAaveReserveData$,
    getAaveV3BaseCurrencyUnit$,
  }
}
