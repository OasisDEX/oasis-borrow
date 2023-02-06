import BigNumber from 'bignumber.js'
import {
  createAaveV3OracleAssetPriceData$,
  createConvertToAaveV3OracleAssetPrice$,
  getAaveV3AssetsPrices,
  getAaveV3OracleBaseCurrencyUnit,
  getAaveV3PositionLiquidation$,
  getAaveV3ReserveConfigurationData,
  getAaveV3ReserveData,
  getAaveV3ReservesList,
  getAaveV3UserAccountData,
  getAaveV3UserConfiguration,
  getAaveV3UserReserveData,
} from 'blockchain/aave-v3'
import { observe } from 'blockchain/calls/observe'
import { Context } from 'blockchain/network'
import { getOnChainPosition } from 'features/aave/oasisActionsLibWrapper'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import { from, Observable } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'

import {
  createAaveV3PrepareReserveData$,
  getAaveProtocolData$,
  getAaveProxyConfiguration$,
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
  const aaveOracleAssetPriceData$ = memoize(
    curry(createAaveV3OracleAssetPriceData$)(refresh$, context$),
  )

  const getAaveOnChainPosition$ = memoize(
    (collateralToken: string, debtToken: string, proxyAddress: string) => {
      return context$.pipe(
        switchMap((context) => {
          return from(getOnChainPosition({ context, proxyAddress, collateralToken, debtToken }))
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

  const convertToAaveOracleAssetPrice$ = memoize(
    curry(createConvertToAaveV3OracleAssetPrice$)(aaveOracleAssetPriceData$),
    (args: { token: string; amount: BigNumber }) => args.token + args.amount.toString(),
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
    aaveReserveConfigurationData$,
    convertToAaveOracleAssetPrice$,
    aaveOracleAssetPriceData$,
    getAaveReserveData$,
  }
}
