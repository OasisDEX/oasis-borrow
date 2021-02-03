import { amountFromWei, amountToWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { bindNodeCallback, combineLatest, from, Observable, of } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'
import { Context } from './network'
import { tokenAllowance, tokenBalance } from './calls/erc20'
import { CallObservable } from './calls/observe'
import { Dictionary } from 'ts-essentials'
import { zipObject } from 'lodash'

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
          map((ethBalance) => amountFromWei(new BigNumber(ethBalance))),
          distinctUntilChanged((x: BigNumber, y: BigNumber) => x.eq(y)),
          shareReplay(1),
        )
      }
      return tokenBalance$({ token, account: address })
    }),
  )
}

// Given a list of tokens and an address,
// returns balances for all tokens of that address
// as a dictionary
export function createBalances$(
  balance$: (token: string, address: string) => Observable<BigNumber>,
  tokenList$: Observable<string[]>,
  account: string,
): Observable<Dictionary<BigNumber>> {
  return tokenList$.pipe(
    switchMap((tokens) =>
      combineLatest(tokens.map((token) => balance$(token, account))).pipe(
        map((balances) => zipObject(tokens, balances)),
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
      if (token === 'ETH') return of(true)
      return tokenAllowance$({ token, owner, spender })
    }),
  )
}

export function createTokens$(context$: Observable<Context>): Observable<string[]> {
  return context$.pipe(map((context) => ['ETH', ...Object.keys(context.tokens)]))
}

export function createCollaterals$(context$: Observable<Context>): Observable<string[]> {
  return context$.pipe(map((context) => context.collaterals))
}
