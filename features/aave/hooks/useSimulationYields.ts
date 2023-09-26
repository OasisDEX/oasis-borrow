import type { IRiskRatio } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { CalculateSimulationResult } from 'features/aave/open/services'
import { calculateSimulation } from 'features/aave/open/services'
import type { IStrategyConfig } from 'features/aave/types/strategy-config'
import type {
  AaveLikeYieldsResponse,
  FilterYieldFieldsType,
} from 'lendingProtocols/aave-like-common'
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

export type SimulationYields = CalculateSimulationResult & { yields: AaveLikeYieldsResponse }

export function useSimulationYields({
  amount,
  riskRatio,
  fields,
  strategy,
  token,
  fees,
}: useSimulationYieldsParams): SimulationYields | undefined {
  const [simulations, setSimulations] = useState<SimulationYields>()
  const yields = useAaveEarnYields(riskRatio, strategy.protocol, strategy.network, fields)

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
