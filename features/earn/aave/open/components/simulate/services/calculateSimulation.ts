import BigNumber from 'bignumber.js'

import { zero } from '../../../../../../../helpers/zero'
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
  return {
    apy: new BigNumber(12),
    breakEven: new BigNumber(23),
    entryFees: fees || zero,
    previous30Days: getSimulation({
      amount,
      annualizedYield: yields.annualised30Yield,
      token,
    }),
    previous90Days: getSimulation({
      amount,
      annualizedYield: yields.annualised90Yield,
      token,
    }),
    previous1Year: getSimulation({
      amount,
      annualizedYield: yields.annualised1Yield,
      token,
    }),
    sinceInception: {
      earningAfterFees: new BigNumber(1.2),
      netValue: new BigNumber(101.2),
      token,
    },
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
