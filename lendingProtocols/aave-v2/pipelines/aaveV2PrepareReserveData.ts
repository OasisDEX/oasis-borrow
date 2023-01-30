import BigNumber from 'bignumber.js'
import {
  AaveV2ReserveDataParameters,
  AaveV2ReserveDataReply,
} from 'blockchain/aave/aaveV2ProtocolDataProvider'
import { amountFromRay, amountFromWei } from 'blockchain/utils'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export type PreparedAaveReserveData = {
  availableLiquidity: BigNumber
  variableBorrowRate: BigNumber
  liquidityRate: BigNumber
}

export function createAaveV2PrepareReserveData$(
  aaveReserveData$: (args: AaveV2ReserveDataParameters) => Observable<AaveV2ReserveDataReply>,
  token: string,
): Observable<PreparedAaveReserveData> {
  return aaveReserveData$({ token }).pipe(
    map((reserveData: AaveV2ReserveDataReply) => ({
      // TODO: if/when all things below are required from observe(aaveReserveData$), we can get rid of this file
      availableLiquidity: amountFromWei(new BigNumber(reserveData.availableLiquidity), token),
      liquidityRate: amountFromRay(new BigNumber(reserveData.liquidityRate)), // the current variable borrow rate. Expressed in ray
      variableBorrowRate: amountFromRay(new BigNumber(reserveData.variableBorrowRate)),
    })),
  )
}
