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
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'
import { memoize } from 'lodash'
import { from, Observable } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'

import {
  createAaveV2PrepareReserveData$,
  getAaveProtocolData$,
  getAaveProxyConfiguration$,
  prepareAaveAvailableLiquidityInUSDC$,
} from './pipelines'
import curry from 'ramda/src/curry'

interface AaveV2ServicesDependencies {
  context$: Observable<Context>
  refresh$: Observable<unknown>
  once$: Observable<unknown>
}
export function getAaveV2Services({ context$, refresh$, once$ }: AaveV2ServicesDependencies) {
  const aaveLiquidations$ = memoize(
    curry(getAaveV2PositionLiquidation$)(context$),
    (proxyAddress) => proxyAddress,
  )

  const aaveUserAccountData$ = observe(
    refresh$,
    context$,
    getAaveV2UserAccountData,
    (args) => args.address,
  )

  const getAaveReserveData$ = observe(once$, context$, getAaveV2ReserveData)
  const getAaveAssetsPrices$ = observe(once$, context$, getAaveV2AssetsPrices)

  const aaveAvailableLiquidityInUSDC$ = memoize(
    curry(prepareAaveAvailableLiquidityInUSDC$)(
      getAaveReserveData$,
      // @ts-expect-error
      getAaveAssetsPrices$({ tokens: ['USDC'] }), //this needs to be fixed in OasisDEX/transactions -> CallDef
    ),
    ({ token }) => token,
  )

  const aaveUserReserveData$ = observe(refresh$, context$, getAaveV2UserReserveData)
  const aaveUserConfiguration$ = observe(refresh$, context$, getAaveV2UserConfiguration)
  const aaveReservesList$ = observe(refresh$, context$, getAaveV2ReservesList)()
  const aaveOracleAssetPriceData$ = memoize(
    curry(createAaveV2OracleAssetPriceData$)(refresh$, context$),
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

  const wrappedGetAaveReserveData$ = memoize(
    curry(createAaveV2PrepareReserveData$)(
      observe(refresh$, context$, getAaveV2ReserveData, (args) => args.token),
    ),
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
    wrappedGetAaveReserveData$,
    getAaveAssetsPrices$,
    aaveReserveConfigurationData$,
    convertToAaveOracleAssetPrice$,
    aaveOracleAssetPriceData$,
    getAaveReserveData$,
  }
}
