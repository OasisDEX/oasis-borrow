import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { map } from 'rxjs/operators'
import type { OasisStats } from 'server/snowflake'

export function getOasisStats$(): Observable<OasisStats> {
  return ajax.get('/api/stats').pipe(map(({ response }) => response))
}
