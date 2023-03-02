import { IRiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { IStrategyConfig } from 'features/aave/common'
import { calculateSimulation } from 'features/aave/open/services'
import { AaveYieldsResponse, FilterYieldFieldsType } from 'lendingProtocols/common'
import { useEffect, useState } from 'react'

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
    ReturnType<typeof calculateSimulation> & { yields: AaveYieldsResponse }
  >()
  const { aaveEarnYieldsQuery } = useAaveContext(strategy.protocol)

  useEffect(() => {
    if (riskRatio && amount && !simulations) {
      void (async () => {
        const yields = await aaveEarnYieldsQuery(riskRatio, fields)
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
  }, [aaveEarnYieldsQuery, amount, fields, riskRatio, simulations])
  return simulations
}
