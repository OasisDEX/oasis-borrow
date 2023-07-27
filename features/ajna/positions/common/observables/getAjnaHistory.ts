import { AjnaUnifiedHistoryEvent } from 'features/ajna/common/ajnaUnifiedHistoryEvent'
import { getAjnaHistory } from 'features/ajna/positions/common/helpers/getAjnaHistory'
import { mapAjnaBorrowishEvents } from 'features/ajna/positions/common/helpers/mapBorrowishEvents'
import { mapAjnaEarnEvents } from 'features/ajna/positions/common/helpers/mapEarnEvents'
import { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { from, Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

export const getAjnaHistory$ = ({
  dpmPositionData: { proxy, product, collateralTokenAddress, quoteTokenAddress },
}: {
  dpmPositionData: DpmPositionData
}): Observable<AjnaUnifiedHistoryEvent[]> => {
  return from(getAjnaHistory(proxy)).pipe(
    map((data) => {
      switch (product) {
        case 'borrow':
        case 'multiply': {
          return mapAjnaBorrowishEvents(data)
        }
        case 'earn':
          return mapAjnaEarnEvents(data)
        default:
          return []
      }
    }),
    map((data) =>
      // filter events that are from different positions of the same kind (i.e. 2x earn) but on different pools
      // since currently subgraph aggregate all existing events for given proxy
      data.filter(
        (item) =>
          item.collateralAddress?.toLowerCase() === collateralTokenAddress.toLowerCase() &&
          item.debtAddress?.toLowerCase() === quoteTokenAddress.toLowerCase(),
      ),
    ),
    shareReplay(1),
  )
}
