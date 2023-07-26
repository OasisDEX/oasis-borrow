import BigNumber from 'bignumber.js'
import { getAjnaPositionCumulatives } from 'features/ajna/positions/common/helpers/getAjnaPositionCumulatives'
import { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { from, Observable } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

export type AjnaPositionCumulatives = {
  cumulativeDeposit: BigNumber
  cumulativeWithdraw: BigNumber
  cumulativeFees: BigNumber
}

export const getPositionCumulatives$ = ({
  dpmPositionData: { proxy },
}: {
  dpmPositionData: DpmPositionData
}): Observable<AjnaPositionCumulatives> => {
  return from(getAjnaPositionCumulatives(proxy)).pipe(shareReplay(1))
}
