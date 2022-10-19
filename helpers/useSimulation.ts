import { IRiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { calculateSimulation, FilterYieldFieldsType } from 'features/earn/aave/open/services'
import { useEffect, useState } from 'react'

type useSimulationParams = {
  amount?: BigNumber
  riskRatio?: IRiskRatio
  fields: FilterYieldFieldsType[]
}

export function useSimulation({ amount, riskRatio, fields }: useSimulationParams) {
  const [simulations, setSimulations] = useState<ReturnType<typeof calculateSimulation>>()
  const { aaveSthEthYieldsQuery } = useAppContext()

  useEffect(() => {
    if (riskRatio && amount && !simulations) {
      void (async () => {
        setSimulations(
          calculateSimulation({
            amount,
            token: 'ETH',
            yields: await aaveSthEthYieldsQuery(riskRatio, fields),
            riskRatio,
          }),
        )
      })()
    }
  }, [amount, riskRatio])
  return simulations
}
