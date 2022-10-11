import { IRiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'

import { one, zero } from '../../../../../helpers/zero'
import { AaveStEthYieldsResponse } from './stEthYield'

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateSimulation({
  amount,
  yields,
  token,
  fees,
}: {
  fees?: BigNumber
  amount: BigNumber
  token: string
  riskRatio: IRiskRatio
  yields: AaveStEthYieldsResponse
}): CalculateSimulationResult {
  const earningsPerDay =
    yields.annualisedYield1Year &&
    amount.times(yields.annualisedYield1Year.plus(one)).minus(amount).div(365)
  return {
    apy: yields.annualisedYield1Year,
    breakEven: earningsPerDay && (fees || zero).div(earningsPerDay),
    entryFees: fees || zero,
    previous7Days:
      yields.annualisedYield7days &&
      getSimulation({
        amount,
        annualizedYield: yields.annualisedYield7days,
        token,
      }),
    previous30Days:
      yields.annualisedYield30days &&
      getSimulation({
        amount,
        annualizedYield: yields.annualisedYield30days,
        token,
      }),
    previous90Days:
      yields.annualisedYield90days &&
      getSimulation({
        amount,
        annualizedYield: yields.annualisedYield90days,
        token,
      }),
    previous1Year:
      yields.annualisedYield1Year &&
      getSimulation({
        amount,
        annualizedYield: yields.annualisedYield1Year,
        token,
      }),
    sinceInception:
      yields.annualisedYieldSinceInception &&
      getSimulation({
        amount,
        annualizedYield: yields.annualisedYieldSinceInception,
        token,
      }),
  }
}

function getSimulation({
  amount,
  annualizedYield,
  token,
}: {
  amount: BigNumber
  annualizedYield: BigNumber
  token: string
}): Simulation {
  const earnings = amount.times(annualizedYield.div(100))
  return {
    earningAfterFees: earnings,
    netValue: earnings.plus(amount),
    token,
  }
}
