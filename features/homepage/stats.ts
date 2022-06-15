import { EMPTY, Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

import type { OasisStats } from './OasisStats'

export function getOasisStats$(): Observable<OasisStats> {
  return ajax.get('/api/stats').pipe(
    map(({ response }) => response),
    catchError(() => EMPTY),
  )
}
