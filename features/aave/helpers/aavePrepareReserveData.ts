import BigNumber from 'bignumber.js'
import { AaveReserveDataReply } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { amountFromRay } from 'blockchain/utils'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export type PreparedAaveReserveData = {
  variableBorrowRate: BigNumber
  liquidityRate: BigNumber
}

export function aavePrepareReserveData() {
  return (
    aaveReserveData$: Observable<AaveReserveDataReply>,
  ): Observable<PreparedAaveReserveData> =>
    combineLatest(aaveReserveData$).pipe(
      map(([reserveData]: [AaveReserveDataReply]) => ({
        // the current variable borrow rate. Expressed in ray
        variableBorrowRate: amountFromRay(new BigNumber(reserveData.variableBorrowRate)),
        liquidityRate: amountFromRay(new BigNumber(reserveData.liquidityRate)), // the current variable borrow rate. Expressed in ray
      })),
    )
}
