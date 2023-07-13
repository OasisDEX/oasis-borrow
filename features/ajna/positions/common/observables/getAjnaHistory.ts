import { AjnaUnifiedHistoryEvent } from 'features/ajna/common/ajnaUnifiedHistoryEvent'
import { getAjnaHistory } from 'features/ajna/positions/common/helpers/getAjnaHistory'
import { mapAjnaBorrowishEvents } from 'features/ajna/positions/common/helpers/mapBorrowishEvents'
import { mapAjnaEarnEvents } from 'features/ajna/positions/common/helpers/mapEarnEvents'
import { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { from, Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

export const getAjnaHistory$ = ({
  dpmPositionData: { proxy, product },
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
    shareReplay(1),
  )
}
