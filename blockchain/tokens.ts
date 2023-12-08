import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { Observable } from 'rxjs'
import { bindNodeCallback, combineLatest, from, of } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import type { tokenAllowance, tokenBalance } from './calls/erc20'
import { getTokenBalanceFromAddress } from './calls/erc20'
import { maxUint256 } from './calls/erc20.constants'
import type { CallObservable } from './calls/observe'
import type { Context } from './network.types'
import { NetworkIds } from './networks'
import type { OraclePriceData, OraclePriceDataArgs } from './prices.types'
import type { TokenBalances } from './tokens.types'

export function createBalance$(
  updateInterval$: Observable<any>,
  context$: Observable<Context>,
  tokenBalance$: CallObservable<typeof tokenBalance>,
  token: string,
  address: string,
) {
  return context$.pipe(
    switchMap(({ web3 }) => {
      if (token === 'ETH') {
        return updateInterval$.pipe(
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

export function createBalanceFromAddress$(
  updateInterval$: Observable<any>,
  context$: Observable<Context>,
  token: { address: string; precision: number },
  address: string,
  networkId: NetworkIds,
) {
  return context$.pipe(
    switchMap(({ web3 }) => {
      const contracts = getNetworkContracts(networkId)
      if (
        'tokens' in contracts &&
        token.address.toLowerCase() === contracts.tokens.ETH.address.toLowerCase()
      ) {
        return updateInterval$.pipe(
          switchMap(() => bindNodeCallback(web3.eth.getBalance)(address)),
          map((ethBalance: string) => amountFromWei(new BigNumber(ethBalance))),
          distinctUntilChanged((x: BigNumber, y: BigNumber) => x.eq(y)),
          shareReplay(1),
        )
      }

      return updateInterval$.pipe(
        switchMap(() =>
          from(
            getTokenBalanceFromAddress({
              address: token.address,
              precision: token.precision,
              account: address,
              networkId,
            }),
          ),
        ),
        distinctUntilChanged((x: BigNumber, y: BigNumber) => x.eq(y)),
        shareReplay(1),
      )
    }),
  )
}

export function createCollateralTokens$(
  ilks$: Observable<string[]>,
  ilkToToken$: (ilk: string) => Observable<string>,
): Observable<string[]> {
  return ilks$.pipe(
    switchMap((ilks) => combineLatest(ilks.map((ilk) => ilkToToken$(ilk)))),
    switchMap((tokens) => of([...new Set(tokens)])),
  )
}

export function createAaveCollateralTokens$(context$: Observable<Context>): Observable<string[]> {
  return context$.pipe(
    map(({ chainId }) => {
      return Object.keys(getNetworkContracts(NetworkIds.MAINNET, chainId).aaveTokens)
    }),
  )
}

export function createAccountBalance$(
  tokenBalance$: (token: string, address: string) => Observable<BigNumber>,
  collateralTokens$: Observable<string[]>,
  oraclePriceData$: (args: OraclePriceDataArgs) => Observable<OraclePriceData>,
  address: string,
): Observable<TokenBalances> {
  return collateralTokens$.pipe(
    switchMap((collateralTokens) =>
      combineLatest(
        collateralTokens.map((collateralToken) =>
          combineLatest(
            of(collateralToken),
            tokenBalance$(collateralToken, address),
            oraclePriceData$({ token: collateralToken, requestedData: ['currentPrice'] }),
          ),
        ),
      ),
    ),
    map((data) =>
      data.reduce(
        (acc, [collateralToken, balance, { currentPrice: price }]) => ({
          ...acc,
          [collateralToken]: { balance, price },
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
