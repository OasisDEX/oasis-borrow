import type { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { shareReplay } from 'rxjs/operators'

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

export function createBalancesFromAddressArrayInfo$(
  balance$: (
    token: { address: string; precision: number },
    address: string,
  ) => Observable<BigNumber>,
  tokens: { address: string; precision: number }[],
  address: string | undefined,
): Observable<BigNumber[]> {
  return combineLatest(tokens.map((token) => (address ? balance$(token, address) : of(zero)))).pipe(
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
