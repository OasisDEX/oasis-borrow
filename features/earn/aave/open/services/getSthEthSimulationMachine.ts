import { IRiskRatio, RiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { AaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { aaveStETHMinimumRiskRatio } from '../../constants'
import { AaveStEthSimulateStateMachine, aaveStEthSimulateStateMachine } from '../state'
import { calculateSimulation } from './calculateSimulation'
import { AaveStEthYieldsResponse, FilterYieldFieldsType } from './stEthYield'

export function getSthEthSimulationMachine(
  getStEthYields: (
    riskRatio: IRiskRatio,
    field: FilterYieldFieldsType[],
  ) => Promise<AaveStEthYieldsResponse>,
  aaveReserveStEthData$: Observable<AaveReserveConfigurationData>,
): Observable<AaveStEthSimulateStateMachine> {
  return combineLatest(aaveReserveStEthData$).pipe(
    map(([aaveReserveStEthData]) => {
      return aaveStEthSimulateStateMachine
        .withConfig({
          services: {
            calculate: async (context) => {
              return calculateSimulation({
                amount: context.amount!,
                token: context.token!,
                yields: context.yieldsMin!, // previously it was 'yields' and they were calculated using minimum risk ratio so i'll leave it like that
                riskRatio: context.riskRatio!,
              })
            },
            getYields: async (context) => {
              const [yieldsMin, yieldsMax] = await Promise.all([
                getStEthYields(context.riskRatio!, [
                  '7Days',
                  '30Days',
                  '90Days',
                  '1Year',
                  'Inception',
                ]),
                getStEthYields(context.riskRatioMax!, [
                  '7Days',
                  '7DaysOffset',
                  '90Days',
                  '90DaysOffset',
                ]),
              ])
              return { yieldsMin, yieldsMax }
            },
          },
        })
        .withContext({
          amount: new BigNumber(100000),
          token: 'ETH',
          riskRatio: aaveStETHMinimumRiskRatio,
          riskRatioMax: new RiskRatio(aaveReserveStEthData.ltv, RiskRatio.TYPE.LTV),
        })
    }),
  )
}
