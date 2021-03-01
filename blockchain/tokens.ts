import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import isEqual from 'lodash/isEqual'
import { bindNodeCallback, combineLatest, Observable, of } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import { maxUint256, tokenAllowance, tokenBalance } from './calls/erc20'
import { CallObservable } from './calls/observe'
import { Context } from './network'
import { OraclePriceData } from './prices'

export function createBalance$(
  onEveryBlock$: Observable<number>,
  context$: Observable<Context>,
  tokenBalance$: CallObservable<typeof tokenBalance>,
  token: string,
  address: string,
) {
  return context$.pipe(
    switchMap(({ web3 }) => {
      if (token === 'ETH') {
        return onEveryBlock$.pipe(
          switchMap(() => bindNodeCallback(web3.eth.getBalance)(address)),
          map((ethBalance: string) => amountFromWei(new BigNumber(ethBalance))),
          distinctUntilChanged((x: BigNumber, y: BigNumber) => x.eq(y)),
          shareReplay(1),
        )
      }
      return tokenBalance$({ token, account: address })
    }),
  )
}

export function createTokens$(
  ilks$: Observable<string[]>,
  ilkToToken$: Observable<(ilk: string) => string>,
): Observable<string[]> {
  return combineLatest(ilks$, ilkToToken$).pipe(
    switchMap(([ilks, ilkToToken]) => of([...new Set(ilks.map(ilkToToken))])),
  )
}

export function createAccountBalance$(
  tokenBalance$: (token: string, address: string) => Observable<BigNumber>,
  tokens$: Observable<string[]>,
  oraclePriceData$: (token: string) => Observable<OraclePriceData>,
  address: string,
): Observable<Record<string, { balance: BigNumber; price: BigNumber }>> {
  return tokens$.pipe(
    switchMap((tokens) =>
      combineLatest(
        tokens.map((token) =>
          combineLatest(of(token), tokenBalance$(token, address), oraclePriceData$(token)),
        ),
      ),
    ),
    map((data) =>
      data.reduce(
        (acc, [token, balance, { currentPrice: price }]) => ({
          ...acc,
          [token]: { balance, price },
        }),
        {},
      ),
    ),
  )
}

export function createAllowance$(
  context$: Observable<Context>,
  tokenAllowance$: CallObservable<typeof tokenAllowance>,
  token: string,
  owner: string,
  spender: string,
) {
  return context$.pipe(
    switchMap(() => {
      if (token === 'ETH') return of(maxUint256)
      return tokenAllowance$({ token, owner, spender })
    }),
  )
}
