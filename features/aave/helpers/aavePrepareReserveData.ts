import BigNumber from 'bignumber.js'
import { AaveReserveDataReply } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { amountFromRay } from 'blockchain/utils'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export type PreparedAaveReserveData = {
  variableBorrowRate: BigNumber
}

export function aavePrepareReserveData() {
  return (
    aaveReserveData$: Observable<AaveReserveDataReply>,
  ): Observable<PreparedAaveReserveData> =>
    combineLatest(aaveReserveData$).pipe(
      map(([reserveData]: [AaveReserveDataReply]) => ({
        // right now I just need this one
        variableBorrowRate: amountFromRay(new BigNumber(reserveData.variableBorrowRate)), //the current variable borrow rate. Expressed in ray
      })),
    )
}
