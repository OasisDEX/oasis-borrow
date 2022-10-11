import { IRiskRatio, RiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'

import { AaveStEthSimulateStateMachine, aaveStEthSimulateStateMachine } from '../state'
import { calculateSimulation } from './calculateSimulation'
import { AaveStEthYieldsResponse, FilterYieldFieldsType } from './stEthYield'

export function getSthEthSimulationMachine(
  getStEthYields: (
    riskRatio: IRiskRatio,
    field: FilterYieldFieldsType[],
  ) => Promise<AaveStEthYieldsResponse>,
): AaveStEthSimulateStateMachine {
  return aaveStEthSimulateStateMachine
    .withConfig({
      services: {
        calculate: async (context) => {
          return calculateSimulation({
            amount: context.amount!,
            token: context.token!,
            yields: context.yields!,
            riskRatio: context.riskRatio!,
          })
        },
        getYields: async (context) => {
          return await getStEthYields(context.riskRatio!, [
            '7Days',
            '7DaysOffset',
            '30Days',
            '90Days',
            '90DaysOffset',
          ])
        },
      },
    })
    .withContext({
      amount: new BigNumber(100000),
      token: 'ETH',
      riskRatio: new RiskRatio(new BigNumber(0), RiskRatio.TYPE.LTV),
    })
}
