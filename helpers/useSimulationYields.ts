import { IRiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { calculateSimulation } from 'features/aave/open/services'
import { useEffect, useState } from 'react'

import { AaveStEthYieldsResponse, FilterYieldFieldsType } from '../features/aave/common'

type useSimulationYieldsParams = {
  amount?: BigNumber
  riskRatio?: IRiskRatio
  fields: FilterYieldFieldsType[]
}

export function useSimulationYields({ amount, riskRatio, fields }: useSimulationYieldsParams) {
  const [simulations, setSimulations] = useState<
    ReturnType<typeof calculateSimulation> & { yields: AaveStEthYieldsResponse }
  >()
  const { aaveSthEthYieldsQuery } = useAppContext()

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
