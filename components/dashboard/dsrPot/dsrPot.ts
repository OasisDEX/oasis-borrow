import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { zero } from 'helpers/zero'
import { equals } from 'ramda'
import { combineLatest, defer, Observable, zip } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import { call } from '../../blockchain/calls/callsHelpers'
import { ContextConnected, EveryBlockFunction$ } from '../../blockchain/network'
import { RAY, SECONDS_PER_YEAR, WAD } from '../../constants'
import { createProxyAddress$ } from '../proxy'
import { DsrEvent, DsrEventKind } from './dsrHistory'
import { pie } from './potCalls'
import { vatDai } from './vatCalls'

export type DsrPotKind = 'dsr'

export type DsrPot =
  | { kind: DsrPotKind; proxyAddress: undefined; apy: BigNumber }
  | {
      kind: DsrPotKind
      proxyAddress: string
      adapterDebtAmount: BigNumber
      dai: BigNumber
      apy: BigNumber
      earnings: BigNumber
      history: DsrEvent[]
    }

// TODO: global setting!
BigNumber.config({ POW_PRECISION: 100 })
function getYearlyRate(apy: BigNumber) {
  return apy.div(RAY).pow(SECONDS_PER_YEAR)
}

export function getApyPercentage(pot: DsrPot) {
  return pot.apy ? pot.apy.minus(1).times(100) : zero
}

interface CalculateDsrBalanceProps {
  pie: BigNumber
  chi: BigNumber
}

export function calculateDsrBalance({ pie, chi }: CalculateDsrBalanceProps) {
  return amountFromWei(pie.times(chi).div(RAY).dp(0, BigNumber.ROUND_FLOOR))
}

function createEarningsToDate$(
  history$: Observable<DsrEvent[]>,
  pie$: Observable<BigNumber>,
  chi$: Observable<BigNumber>,
) {
  const distinctTotals$ = history$.pipe(
    map((history: DsrEvent[]) => {
      const totals = history.reduce(
        (
          acc: {
            [DsrEventKind.dsrDeposit]: BigNumber
            [DsrEventKind.dsrWithdrawal]: BigNumber
          },
          event: DsrEvent,
        ) => {
          const { kind, amount } = event
          return {
            ...acc,
            [kind]: acc[kind].plus(amount),
          }
        },
        {
          [DsrEventKind.dsrDeposit]: zero,
          [DsrEventKind.dsrWithdrawal]: zero,
        },
      )
      return totals[DsrEventKind.dsrWithdrawal].minus(totals[DsrEventKind.dsrDeposit]).div(WAD)
    }),
    distinctUntilChanged((prev, curr) => prev.eq(curr)),
  )

  const distinctPotBalance = combineLatest(pie$, chi$).pipe(
    map(([pie, chi]) => calculateDsrBalance({ pie, chi })),
    distinctUntilChanged((prev, curr) => prev.eq(curr)),
  )

  return zip(distinctTotals$, distinctPotBalance).pipe(
    map(([totals, potBalance]) => potBalance.plus(totals)),
  )
}

export function dsrPot$(
  account: string,
  context: ContextConnected,
  everyBlock$: EveryBlockFunction$,
  history$: Observable<DsrEvent[]>,
  dsr$: Observable<BigNumber>,
  chi$: Observable<BigNumber>,
): Observable<DsrPot> {
  const proxyAddress$ = everyBlock$(createProxyAddress$(context, account))

  return proxyAddress$.pipe(
    switchMap((proxyAddress) => {
      if (!proxyAddress) {
        return dsr$.pipe(
          map((dsr) => ({
            kind: 'dsr',
            proxyAddress: undefined,
            apy: getYearlyRate(dsr),
          })),
        )
      }

      const pie$ = everyBlock$(
        defer(() => call(context, pie)(proxyAddress)),
        equals,
      )

      const adapterDebtAmount$ = everyBlock$(
        defer(() => call(context, vatDai)(proxyAddress)),
        equals,
      )
      const etd$ = createEarningsToDate$(history$, pie$, chi$)
      return combineLatest(pie$, dsr$, chi$, history$, adapterDebtAmount$, etd$).pipe(
        map(([pie, dsr, chi, history, adapterDebtAmount, earnings]) => {
          const dai = calculateDsrBalance({ pie, chi })

          return {
            kind: 'dsr',
            proxyAddress,
            dai,
            adapterDebtAmount,
            apy: getYearlyRate(dsr),
            earnings,
            history,
          }
        }),
      )
    }),
  )
}
