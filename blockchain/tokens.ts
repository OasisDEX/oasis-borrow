import { amountFromWei } from '@oasisdex/utils'
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
          map((ethBalance: string) => amountFromWei(new BigNumber(ethBalance))),
          distinctUntilChanged((x: BigNumber, y: BigNumber) => x.eq(y)),
          shareReplay(1),
        )
      }
      return tokenBalance$({ token, account: address })
    }),
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
