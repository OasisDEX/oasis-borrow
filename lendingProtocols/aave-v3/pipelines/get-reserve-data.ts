import type { AaveV3ReserveCap, AaveV3ReserveDataReply } from 'blockchain/aave-v3'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import type { AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

export function getReserveData(
  reserveData$: (args: { token: string }) => Observable<AaveV3ReserveDataReply>,
  reserveCaps$: (args: { token: string }) => Observable<AaveV3ReserveCap>,
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
        totalSupply: reserveData.totalAToken,
        availableToSupply: reserveCaps.supply.isZero()
          ? maxUint256
          : reserveCaps.supply.minus(reserveData.totalAToken),
        availableToBorrow: reserveCaps.borrow.isZero()
          ? reserveData.availableLiquidity
          : reserveCaps.borrow.minus(
              reserveData.totalStableDebt.plus(reserveData.totalVariableDebt),
            ),
      }
    }),
  )
}
