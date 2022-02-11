import { OasisStats } from 'pages/api/stats'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { map } from 'rxjs/operators'

export function getOasisStats$(): Observable<OasisStats> {
  return ajax.get('/api/stats').pipe(map(({ response }) => response))
}
