import BigNumber from 'bignumber.js'
import { createTokenBalance$ } from 'components/blockchain/erc20'
import { createEtherBalance$ } from 'components/blockchain/etherBalance'
import { Ticker } from 'components/blockchain/prices'
import { isEqual } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

import { Loadable, loadablifyLight } from '../../helpers/loadable'
import { compareBigNumber, ContextConnected, EveryBlockFunction$ } from '../blockchain/network'
import { DsrEvent } from './dsrPot/dsrHistory'
import { DsrPot, dsrPot$, DsrPotKind } from './dsrPot/dsrPot'

export type PotKind = DsrPotKind

export type Pot = DsrPot

export interface Dashboard {
  dai: BigNumber
  daiUSD: BigNumber
  daiAllowance: boolean
  eth: BigNumber
  ethUSD: BigNumber
  pots: Dictionary<Loadable<Pot>, PotKind>
  apy: Dictionary<BigNumber>
}

export function createDashboard$(
  context$: Observable<ContextConnected>,
  everyBlock$: EveryBlockFunction$, // TODO: no need for 2 everyBlocks
  onEveryBlock$: Observable<number>,
  tokenPricesInUSD$: Observable<Ticker>,
  history$: Observable<DsrEvent[]>,
  potDsr$: Observable<BigNumber>,
  potChi$: Observable<BigNumber>,
  getCompoundApy$: Observable<BigNumber | undefined>,
  getAaveApy$: Observable<BigNumber | undefined>,
): Observable<Dashboard> {
  return context$.pipe(
    switchMap((context) => {
      const eth$ = everyBlock$(createEtherBalance$(context, context.account), compareBigNumber)

      const dai$ = everyBlock$(
        createTokenBalance$(context, 'DAI', context.account),
        compareBigNumber,
      )
      const dsr$ = loadablifyLight(
        dsrPot$(context.account, context, everyBlock$, history$, potDsr$, potChi$),
        onEveryBlock$,
      )

      return combineLatest(eth$, dai$, dsr$, tokenPricesInUSD$, getCompoundApy$, getAaveApy$).pipe(
        map(([eth, dai, dsr, tokenPricesUSD, compoundApy, aaveApy]) => ({
          eth,
          ethUSD: eth.multipliedBy(tokenPricesUSD.ETH),
          dai,
          daiUSD: dai.multipliedBy(tokenPricesUSD.DAI),
          daiAllowance: false,
          pots: { dsr },
          apy: {
            compound: compoundApy,
            aave: aaveApy,
          },
        })),
      )
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
