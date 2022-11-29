import BigNumber from 'bignumber.js'
import {
  AaveReserveDataParameters,
  AaveReserveDataReply,
} from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { amountFromRay } from 'blockchain/utils'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export type PreparedAaveReserveData = {
  variableBorrowRate: BigNumber
  liquidityRate: BigNumber
}

export function createAavePrepareReserveData$(
  aaveReserveData$: (args: AaveReserveDataParameters) => Observable<AaveReserveDataReply>,
  token: string,
): Observable<PreparedAaveReserveData> {
  return aaveReserveData$({ token }).pipe(
    map((reserveData: AaveReserveDataReply) => ({
      // TODO: if/when all things below are required from observe(aaveReserveData$), we can get rid of this file
      variableBorrowRate: amountFromRay(new BigNumber(reserveData.variableBorrowRate)),
      liquidityRate: amountFromRay(new BigNumber(reserveData.liquidityRate)), // the current variable borrow rate. Expressed in ray
    })),
  )
}
