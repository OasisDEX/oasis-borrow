import BigNumber from 'bignumber.js'
import type {
  AaveV3ReserveCap,
  AaveV3ReserveDataReply,
  AaveV3ReserveTokenAddresses,
} from 'blockchain/aave-v3'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import type {
  SparkReserveCap,
  SparkV3ReserveDataReply,
  SparkV3ReserveTokenAddresses,
} from 'blockchain/spark-v3'
import { zero } from 'helpers/zero'
import type { AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

export function getAaveLikeReserveData(
  reserveData$: (args: {
    token: string
  }) => Observable<AaveV3ReserveDataReply | SparkV3ReserveDataReply>,
  reserveCaps$: (args: { token: string }) => Observable<AaveV3ReserveCap | SparkReserveCap>,
  reserveTokenAddresses$: (args: {
    token: string
  }) => Observable<AaveV3ReserveTokenAddresses | SparkV3ReserveTokenAddresses>,
  args: { token: string },
): Observable<AaveLikeReserveData> {
  return combineLatest(reserveData$(args), reserveCaps$(args), reserveTokenAddresses$(args)).pipe(
    map(([reserveData, reserveCaps, reserveTokenAddresses]) => {
      return {
        tokenAddress: reserveTokenAddresses.tokenAddress,
        variableDebtAddress: reserveTokenAddresses.variableDebtTokenAddress,
        availableLiquidity: reserveData.availableLiquidity,
        variableBorrowRate: reserveData.variableBorrowRate,
        liquidityRate: reserveData.liquidityRate,
        caps: {
          borrow: reserveCaps.borrow,
          supply: reserveCaps.supply,
        },
        totalDebt: reserveData.totalStableDebt.plus(reserveData.totalVariableDebt),
        totalSupply: reserveData.totalToken,
        availableToSupply: reserveCaps.supply.isZero()
          ? maxUint256
          : reserveCaps.supply.minus(
              reserveData.totalToken.plus(reserveData.accruedToTreasuryScaled),
            ),
        availableToBorrow: BigNumber.maximum(
          reserveCaps.borrow.isZero()
            ? reserveData.availableLiquidity
            : reserveCaps.borrow.minus(
                reserveData.totalStableDebt.plus(reserveData.totalVariableDebt),
              ),
          zero,
        ),
      }
    }),
  )
}
