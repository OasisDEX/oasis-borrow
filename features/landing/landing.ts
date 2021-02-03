import { IlkDataSummary } from 'blockchain/ilks'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Landing {
  rows: IlkDataSummary[]
}

export function createLanding$(ilkOverview$: Observable<IlkDataSummary[]>): Observable<Landing> {
  return ilkOverview$.pipe(
    map((ilks) => ({
      rows: ilks,
    })),
  )
}
