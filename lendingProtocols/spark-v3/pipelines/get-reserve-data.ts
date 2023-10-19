import type { SparkReserveCap, SparkV3ReserveDataReply } from 'blockchain/spark-v3'
import type { AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

export function getReserveData(
  reserveData$: (args: { token: string }) => Observable<SparkV3ReserveDataReply>,
  reserveCaps$: (args: { token: string }) => Observable<SparkReserveCap>,
  args: { token: string },
): Observable<AaveLikeReserveData> {
  return combineLatest(reserveData$(args), reserveCaps$(args)).pipe(
    map(([reserveData, reserveCaps]) => {
      return {
        availableLiquidity: reserveData.availableLiquidity,
        variableBorrowRate: reserveData.variableBorrowRate,
        liquidityRate: reserveData.liquidityRate,
        caps: {
          borrow: reserveCaps.borrow,
          supply: reserveCaps.supply,
        },
        totalDebt: reserveData.totalStableDebt.plus(reserveData.totalVariableDebt),
        totalSupply: reserveData.totalSpToken,
        availableToSupply: reserveCaps.supply.minus(reserveData.totalSpToken),
        availableToBorrow: reserveCaps.borrow.minus(
          reserveData.totalStableDebt.plus(reserveData.totalVariableDebt),
        ),
      }
    }),
  )
}
