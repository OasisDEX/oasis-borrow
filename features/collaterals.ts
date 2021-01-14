import * as mainnetAddresses from '/components/blockchain/addresses/mainnet.json'
import { Context } from '../components/blockchain/network'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export function createCollaterals$(
  context$: Observable<Context>
): Observable<string[]> {
  return context$.pipe(
    map(context => context.collaterals)
  )
}
