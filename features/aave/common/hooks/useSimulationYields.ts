import { IRiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { calculateSimulation, CalculateSimulationResult } from 'features/aave/open/services'
import { AaveYieldsResponse, FilterYieldFieldsType } from 'lendingProtocols/aaveCommon'
import { useEffect, useState } from 'react'

import { useAaveEarnYields } from './useAaveEarnYields'

type useSimulationYieldsParams = {
  amount?: BigNumber
  riskRatio?: IRiskRatio
  fields: FilterYieldFieldsType[]
  strategy: IStrategyConfig
  token: string
  fees?: BigNumber
}

export type SimulationYields = CalculateSimulationResult & { yields: AaveYieldsResponse }

export function useSimulationYields({
  amount,
  riskRatio,
  fields,
  strategy,
  token,
  fees,
}: useSimulationYieldsParams): SimulationYields | undefined {
  const [simulations, setSimulations] = useState<SimulationYields>()
  const yields = useAaveEarnYields(riskRatio, strategy.protocol, fields)

  useEffect(() => {
    if (yields && amount) {
      setSimulations({
        ...calculateSimulation({
          amount,
          token,
          yields,
          fees,
        }),
        yields,
      })
    }
  }, [fees, amount, token, yields])
  return simulations
}
