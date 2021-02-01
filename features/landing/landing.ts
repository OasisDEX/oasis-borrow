import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { IlkOverview } from './ilksOverview'

export interface Landing {
  rows: IlkOverview[]
}

export function createLanding$(
  ilkOverview$: Observable<IlkOverview[]>
): Observable<Landing> {
  return ilkOverview$.pipe(
    map(ilks => ({
      rows: ilks
    }))
  )
}