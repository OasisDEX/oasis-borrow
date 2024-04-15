import type BigNumber from 'bignumber.js'
import type { GetYieldsResponseMapped } from 'helpers/lambda/yields'
import { one, zero } from 'helpers/zero'

export interface Simulation {
  earningAfterFees: BigNumber
  netValue: BigNumber
  token: string
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

export function calculateOmniYieldsSimulation({
  amount,
  yields,
  token,
  fees,
}: {
  fees?: BigNumber
  amount: BigNumber
  token: string
  yields: GetYieldsResponseMapped
}): CalculateSimulationResult {
  const earningsPerDay =
    yields.apy7d && amount.times(yields.apy7d.div(100).plus(one)).minus(amount).div(365)
  return {
    apy: yields.apy7d,
    breakEven: earningsPerDay && (fees || zero).div(earningsPerDay),
    entryFees: fees || zero,
    previous7Days:
      yields.apy7d &&
      getSimulation({
        amount,
        annualizedYield: yields.apy7d,
        token,
        days: 7,
      }),
    previous30Days:
      yields.apy30d &&
      getSimulation({
        amount,
        annualizedYield: yields.apy30d,
        token,
        days: 30,
      }),
    previous90Days:
      yields.apy90d &&
      getSimulation({
        amount,
        annualizedYield: yields.apy90d,
        token,
        days: 90,
      }),
    previous1Year:
      yields.apy &&
      getSimulation({
        amount,
        annualizedYield: yields.apy,
        token,
        days: 365,
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
  }
}
