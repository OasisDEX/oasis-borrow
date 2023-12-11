import type { BigNumber } from 'bignumber.js'
import { tokenBalance } from 'blockchain/better-calls/erc20'
import type { NetworkIds } from 'blockchain/networks'
import { zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { combineLatest, from, of } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { catchError, shareReplay } from 'rxjs/operators'

import type { BalanceInfo, BalanceInfoChange } from './balanceInfo.types'

export function createBalanceInfo$(
  balance$: (token: string, address: string) => Observable<BigNumber>,
  token: string,
  address: string | undefined,
): Observable<BalanceInfo> {
  return combineLatest(
    address ? balance$(token, address) : of(zero),
    address ? balance$('ETH', address) : of(zero),
    address ? balance$('DAI', address) : of(zero),
  ).pipe(
    map(([collateralBalance, ethBalance, daiBalance]) => ({
      collateralBalance,
      ethBalance,
      daiBalance,
    })),
  )
}

/**
 * @deprecated This is old stuff. It uses `web3.js`. We want to move to `ethers.js`. Use getTokenBalances$ instead.
 */
export function createBalancesArrayInfo$(
  balance$: (token: string, address: string) => Observable<BigNumber>,
  tokens: string[],
  address: string | undefined,
): Observable<BigNumber[]> {
  return combineLatest(tokens.map((token) => (address ? balance$(token, address) : of(zero)))).pipe(
    map((balances) => balances),
    shareReplay(1),
  )
}

// observable that uses ethers
export function getTokenBalances$(
  tokens: string[],
  account: string,
  networkId: NetworkIds,
): Observable<BigNumber[]> {
  return combineLatest(
    tokens.map((token) => from(tokenBalance({ token, account, networkId }))),
  ).pipe(
    map((balances) => balances),
    shareReplay(1),
    catchError((error) => {
      console.warn('Getting token balances error', error)
      return of(tokens.map(() => zero))
    }),
  )
}

export function createBalancesFromAddressArrayInfo$(
  balance$: (
    token: { address: string; precision: number },
    address: string,
    networkId: NetworkIds,
  ) => Observable<BigNumber>,
  tokens: { address: string; precision: number }[],
  address: string | undefined,
  networkId: NetworkIds,
): Observable<BigNumber[]> {
  return combineLatest(
    tokens.map((token) => (address ? balance$(token, address, networkId) : of(zero))),
  ).pipe(
    map((balances) => balances),
    shareReplay(1),
  )
}

export function balanceInfoChange$(
  balanceInfo$: (token: string, account: string | undefined) => Observable<BalanceInfo>,
  token: string,
  account: string | undefined,
): Observable<BalanceInfoChange> {
  return balanceInfo$(token, account).pipe(
    map((balanceInfo) => ({
      kind: 'balanceInfo',
      balanceInfo,
    })),
  )
}
