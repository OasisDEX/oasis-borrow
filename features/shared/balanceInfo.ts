import { BigNumber } from 'bignumber.js'
import { combineLatest, Observable, of } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'

import { zero } from '../../helpers/zero'

export interface BalanceInfo {
  collateralBalance: BigNumber
  ethBalance: BigNumber
  daiBalance: BigNumber
}

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

export interface BalanceInfoChange {
  kind: 'balanceInfo'
  balanceInfo: BalanceInfo
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

export interface BuildBalanceInfoProps {
  _balance$: Observable<BalanceInfo>
  collateralBalance?: BigNumber
  ethBalance?: BigNumber
  daiBalance?: BigNumber
  address: string | undefined
}

const defaultCollateralBalance = new BigNumber('300')
const defaultEthBalance = new BigNumber('20')
const defaultDaiBalance = new BigNumber('1000')

export function buildBalanceInfo$({
  _balance$,
  collateralBalance = defaultCollateralBalance,
  ethBalance = defaultEthBalance,
  daiBalance = defaultDaiBalance,
  address,
}: BuildBalanceInfoProps): Observable<BalanceInfo> {
  return (
    _balance$ ||
    of({
      collateralBalance: address ? collateralBalance : zero,
      ethBalance: address ? ethBalance : zero,
      daiBalance: address ? daiBalance : zero,
    })
  )
}
