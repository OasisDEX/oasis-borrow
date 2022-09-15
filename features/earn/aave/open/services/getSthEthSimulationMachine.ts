import BigNumber from 'bignumber.js'

import { IRiskRatio, RiskRatio } from '../../../../../../oasis-earn-sc/packages/oasis-actions'
import { AaveStEthSimulateStateMachine, aaveStEthSimulateStateMachine } from '../state'
import { calculateSimulation } from './calculateSimulation'
import { AaveStEthYieldsResponse } from './stEthYield'

export function getSthEthSimulationMachine(
  getStEthYields: (riskRatio: IRiskRatio) => Promise<AaveStEthYieldsResponse>,
): AaveStEthSimulateStateMachine {
  return aaveStEthSimulateStateMachine
    .withConfig({
      services: {
        calculate: async (context) => {
          console.log(`getSthEthSimulationMachine ${context.riskRatio?.loanToValue}`)
          return calculateSimulation({
            amount: context.amount!,
            token: context.token!,
            yields: context.yields!,
            riskRatio: context.riskRatio!,
          })
        },
        getYields: async (context) => {
          return await getStEthYields(context.riskRatio!)
        },
      },
    })
    .withContext({
      amount: new BigNumber(100000),
      token: 'ETH',
      riskRatio: new RiskRatio(new BigNumber(0), RiskRatio.TYPE.LTV),
    })
}
