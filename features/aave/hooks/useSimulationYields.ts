import type { IRiskRatio } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { CalculateSimulationResult } from 'features/aave/open/services'
import { calculateSimulation } from 'features/aave/open/services'
import type { IStrategyConfig } from 'features/aave/types/strategy-config'
import type { GetYieldsResponseMapped } from 'helpers/lambda/yields'
import { useEffect, useState } from 'react'

import { useAaveEarnYields } from './useAaveEarnYields'

type useSimulationYieldsParams = {
  amount?: BigNumber
  riskRatio?: IRiskRatio
  strategy: IStrategyConfig
  token: string
  fees?: BigNumber
}

export type SimulationYields = CalculateSimulationResult & { yields: GetYieldsResponseMapped }

export function useSimulationYields({
  amount,
  riskRatio,
  strategy,
  token,
  fees,
}: useSimulationYieldsParams): SimulationYields | undefined {
  const [simulations, setSimulations] = useState<SimulationYields>()
  const yields = useAaveEarnYields(riskRatio, strategy.protocol, strategy.network)

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
  }, [fees?.toString(), amount?.toString(), token, yields])
  return simulations
}
