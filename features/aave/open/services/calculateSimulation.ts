import type BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import { one, zero } from 'helpers/zero'
import type { AaveLikeYieldsResponse } from 'lendingProtocols/aave-like-common'

const AAVE_INCEPTION_DATE = dayjs('2022-02-28')

export interface Simulation {
  earningAfterFees: BigNumber
  netValue: BigNumber
  token: string
  hasData: boolean
}

export interface CalculateSimulationResult {
  breakEven?: BigNumber
  entryFees?: BigNumber
  apy?: BigNumber
  previous7Days?: Simulation
  previous30Days?: Simulation
  previous90Days?: Simulation
  previous1Year?: Simulation
  sinceInception?: Simulation
}

export function calculateSimulation({
  amount,
  yields,
  token,
  fees,
}: {
  fees?: BigNumber
  amount: BigNumber
  token: string
  yields: AaveLikeYieldsResponse
}): CalculateSimulationResult {
  const earningsPerDay =
    yields.annualisedYield7days &&
    amount.times(yields.annualisedYield7days.div(100).plus(one)).minus(amount).div(365)
  return {
    apy: yields.annualisedYield7days,
    breakEven: earningsPerDay && (fees || zero).div(earningsPerDay),
    entryFees: fees || zero,
    previous7Days:
      yields.annualisedYield7days &&
      getSimulation({
        amount,
        annualizedYield: yields.annualisedYield7days,
        token,
        days: 7,
      }),
    previous30Days:
      yields.annualisedYield30days &&
      getSimulation({
        amount,
        annualizedYield: yields.annualisedYield30days,
        token,
        days: 30,
      }),
    previous90Days:
      yields.annualisedYield90days &&
      getSimulation({
        amount,
        annualizedYield: yields.annualisedYield90days,
        token,
        days: 90,
      }),
    previous1Year:
      yields.annualisedYield1Year &&
      getSimulation({
        amount,
        annualizedYield: yields.annualisedYield1Year,
        token,
        days: 365,
      }),
    sinceInception:
      yields.annualisedYieldSinceInception &&
      getSimulation({
        amount,
        annualizedYield: yields.annualisedYieldSinceInception,
        token,
        days: dayjs().diff(AAVE_INCEPTION_DATE, 'days'),
      }),
  }
}

function getSimulation({
  amount,
  annualizedYield,
  token,
  days,
}: {
  amount: BigNumber
  annualizedYield: BigNumber
  token: string
  days: number
}): Simulation {
  const earningsPerDay = amount.times(annualizedYield.div(100).plus(one)).minus(amount).div(365)
  const earnings = earningsPerDay.times(days)
  return {
    earningAfterFees: earnings,
    netValue: earnings.plus(amount),
    token,
    hasData: true,
  }
}
