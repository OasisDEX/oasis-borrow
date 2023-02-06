import { IRiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { calculateSimulation } from 'features/aave/open/services'
import { useEffect, useState } from 'react'

import { AaveStEthYieldsResponse, FilterYieldFieldsType } from '../features/aave/common'
import { IStrategyConfig } from '../features/aave/common/StrategyConfigTypes'

type useSimulationYieldsParams = {
  amount?: BigNumber
  riskRatio?: IRiskRatio
  fields: FilterYieldFieldsType[]
  strategy: IStrategyConfig
}

export function useSimulationYields({
  amount,
  riskRatio,
  fields,
  strategy,
}: useSimulationYieldsParams) {
  const [simulations, setSimulations] = useState<
    ReturnType<typeof calculateSimulation> & { yields: AaveStEthYieldsResponse }
  >()
  const { aaveSthEthYieldsQuery } = useAaveContext(strategy.protocol)

  useEffect(() => {
    if (riskRatio && amount && !simulations) {
      void (async () => {
        const yields = await aaveSthEthYieldsQuery(riskRatio, fields)
        setSimulations({
          ...calculateSimulation({
            amount,
            token: 'ETH',
            yields,
          }),
          yields,
        })
      })()
    }
  }, [amount, riskRatio])
  return simulations
}
