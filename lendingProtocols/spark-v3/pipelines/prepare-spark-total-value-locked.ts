import BigNumber from 'bignumber.js'
import type { SparkV3ReserveDataReply } from 'blockchain/spark-v3'
import type { AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

export type PreparedSparkTotalValueLocked = {
  totalValueLocked: BigNumber
}

type PrepareSparkTVLProps = [SparkV3ReserveDataReply, SparkV3ReserveDataReply, BigNumber[]]

export function prepareSparkTotalValueLocked$(
  getSparkWstEthReserveData$: Observable<AaveLikeReserveData>,
  getSparkWEthReserveData$: Observable<AaveLikeReserveData>,
  getSparkAssetsPrices$: Observable<BigNumber[]>,
): Observable<PreparedSparkTotalValueLocked> {
  return combineLatest(
    getSparkWstEthReserveData$,
    getSparkWEthReserveData$,
    getSparkAssetsPrices$,
  ).pipe(
    map(([WSTETH_reserveData, ETH_reserveData, [ethPrice, wstEthPrice]]: PrepareSparkTVLProps) => {
      const wstEthAvailableLiquidity = new BigNumber(WSTETH_reserveData.availableLiquidity)
      const WETH_totalStableDebt = new BigNumber(ETH_reserveData.totalStableDebt)
      const WETH_totalVariableDebt = new BigNumber(ETH_reserveData.totalVariableDebt)

      const availableLiquidityInUsdc = wstEthAvailableLiquidity.times(wstEthPrice)
      const wethTotalDebt = WETH_totalStableDebt.plus(WETH_totalVariableDebt).times(ethPrice) // total debt in WETH in USDC
      const totalValueLocked = availableLiquidityInUsdc.minus(wethTotalDebt) // total value locked in USDC

      return {
        totalValueLocked,
      }
    }),
  )
}
