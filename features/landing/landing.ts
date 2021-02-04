import { IlkDataList } from 'blockchain/ilks'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Landing {
  rows: IlkDataList
}

export function createLanding$(ilkDataList$: Observable<IlkDataList>): Observable<Landing> {
  return ilkDataList$.pipe(
    map((ilks) => ({
      rows: ilks,
    })),
  )
}
