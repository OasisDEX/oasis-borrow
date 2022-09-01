import BigNumber from 'bignumber.js'

import { one, zero } from '../../../../../helpers/zero'
import { AaveStEthYieldsResponse } from './stEthYield'

export interface Simulation {
  earningAfterFees: BigNumber
  netValue: BigNumber
  token: string
}

export interface CalculateSimulationResult {
  breakEven: BigNumber
  entryFees: BigNumber
  apy: BigNumber
  previous30Days: Simulation
  previous90Days: Simulation
  previous1Year: Simulation
  sinceInception: Simulation
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
  multiply: BigNumber
  yields: AaveStEthYieldsResponse
}): CalculateSimulationResult {
  const earningsPerDay = amount.times(yields.annualisedYield1Year.plus(one)).minus(amount).div(365)
  return {
    apy: yields.annualisedYield1Year,
    breakEven: (fees || zero).div(earningsPerDay),
    entryFees: fees || zero,
    previous30Days: getSimulation({
      amount,
      annualizedYield: yields.annualisedYield30days,
      token,
    }),
    previous90Days: getSimulation({
      amount,
      annualizedYield: yields.annualisedYield90days,
      token,
    }),
    previous1Year: getSimulation({
      amount,
      annualizedYield: yields.annualisedYield1Year,
      token,
    }),
    sinceInception: getSimulation({
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
  const earnigs = amount.times(annualizedYield.div(100))
  return {
    earningAfterFees: earnigs,
    netValue: earnigs.plus(amount),
    token,
  }
}
