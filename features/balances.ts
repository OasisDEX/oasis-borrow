import BigNumber from 'bignumber.js'
import { zipObject } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

import { tokenBalance } from '../components/blockchain/calls/erc20'
import { CallObservable } from '../components/blockchain/calls/observe'

export function createBalances$(
  collaterals$: Observable<string[]>,
  balance$: CallObservable<typeof tokenBalance>,
  account: string,
): Observable<Dictionary<BigNumber>> {
  return collaterals$.pipe(
    switchMap((tokens) =>
      combineLatest(tokens.map((token) => balance$({ token, account }))).pipe(
        map((balances) => zipObject(tokens, balances)),
      ),
    ),
  )
}
