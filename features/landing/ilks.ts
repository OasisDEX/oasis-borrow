
import { Context } from 'components/blockchain/network'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export function createIlks$(context$: Observable<Context>): Observable<string[]> {
  return context$.pipe(map((context) => Object.keys(context.joins).filter(join => join !== 'DAI' && join !== 'SAI')))
}
