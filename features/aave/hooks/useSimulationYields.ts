import { useEffect, useState } from 'react'
import { IRiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { useAaveEarnYields } from 'features/aave/hooks/useAaveEarnYields'
import { calculateSimulation, CalculateSimulationResult } from 'features/aave/open/services'
import { IStrategyConfig } from 'features/aave/types/strategy-config'
import { AaveLikeYieldsResponse, FilterYieldFieldsType } from 'lendingProtocols/aave-like-common'

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
