import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { map } from 'rxjs/operators'

interface Stats {}
export function getOasisStats$(): Observable<Stats> {
  return ajax('/api/stats')
}
