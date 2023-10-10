import type BigNumber from 'bignumber.js'
import type { SparkV3ReserveDataParameters, SparkV3ReserveDataReply } from 'blockchain/spark-v3'
import { zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

type PrepareSparkAvailableLiquidityProps = [SparkV3ReserveDataReply, BigNumber]

export function prepareSparkAvailableLiquidityInUSDC$(
  getSparkReserveData$: (
    token: SparkV3ReserveDataParameters,
  ) => Observable<SparkV3ReserveDataReply>,
  getWETHPrice$: Observable<BigNumber>,
  reserveDataToken: SparkV3ReserveDataParameters,
): Observable<BigNumber> {
  return combineLatest(getSparkReserveData$(reserveDataToken), getWETHPrice$).pipe(
    map(([reserveData, USD_in_WETH_price]: PrepareSparkAvailableLiquidityProps) => {
      const availableLiquidityInETH = reserveData.availableLiquidity
      return availableLiquidityInETH.times(USD_in_WETH_price)
    }),
    catchError((error) => {
      console.error(
        `Can't get Spark V3 available liquidity for ${JSON.stringify(reserveDataToken, null, 2)}`,
        error,
      )
      return of(zero)
    }),
  )
}
