import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import isEqual from 'lodash/isEqual'
import { bindNodeCallback, combineLatest, Observable, of } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import { maxUint256, tokenAllowance, tokenBalance } from './calls/erc20'
import { CallObservable } from './calls/observe'
import { Context } from './network'

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

export type TokenBalances = Record<string, { balance: BigNumber; price: BigNumber }>

export function createAccountBalance$(
  tokenBalance$: (token: string, address: string) => Observable<BigNumber>,
  ilks: Observable<string[]>,
  ilkToToken: Observable<(ilk: string) => string>,
  tokenPrice: (ilk: string) => Observable<BigNumber>,
  address: string,
): Observable<TokenBalances> {
  return combineLatest(ilks, ilkToToken).pipe(
    distinctUntilChanged((a, b) => isEqual(a, b)),
    switchMap(([ilks, ilkToToken]) =>
      of(ilks.map(ilkToToken)).pipe(
        map((tokens) => tokens.map((token, idx) => [token, ilks[idx]])),
        switchMap((pair) =>
          combineLatest(
            pair.map(([token, ilk]) =>
              combineLatest(of(token), tokenBalance$(token, address), tokenPrice(ilk)),
            ),
          ),
        ),
        map((data) =>
          data.reduce(
            (acc, [token, balance, price]) => ({ ...acc, [token]: { balance, price } }),
            {},
          ),
        ),
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
