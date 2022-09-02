import BigNumber from 'bignumber.js'

import { AaveStEthSimulateStateMachine, aaveStEthSimulateStateMachine } from '../state'
import { calculateSimulation } from './calculateSimulation'
import { AaveStEthYieldsResponse } from './stEthYield'

export function getSthEthSimulationMachine(
  getStEthYields: (multiply: BigNumber) => Promise<AaveStEthYieldsResponse>,
): AaveStEthSimulateStateMachine {
  return aaveStEthSimulateStateMachine
    .withConfig({
      services: {
        calculate: async (context) => {
          return calculateSimulation({
            amount: context.amount!,
            token: context.token!,
            yields: context.yields!,
            multiply: context.multiply!,
          })
        },
        getYields: async (context) => {
          return await getStEthYields(context.multiply!)
        },
      },
    })
    .withContext({
      amount: new BigNumber(100000),
      token: 'ETH',
      multiply: new BigNumber(2),
    })
}
