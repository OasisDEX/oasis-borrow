import type BigNumber from 'bignumber.js'
import type { CalculateSimulationResult } from 'features/aave/open/services'
import { calculateSimulation } from 'features/aave/open/services'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import type { AaveLikeYieldsResponse } from 'lendingProtocols/aave-like-common'
import { useEffect, useState } from 'react'

type useSimulationYieldsParams = {
  amount?: BigNumber
  token: string
  getYields: () => AaveLikeYieldsResponse | undefined
}

export type SimulationYields = CalculateSimulationResult & { yields: AaveLikeYieldsResponse }

export function useOmniSimulationYields({
  amount,
  token,
  getYields,
}: useSimulationYieldsParams): SimulationYields | undefined {
  const {
    environment: { gasEstimation, quotePrice },
  } = useOmniGeneralContext()
  const [simulations, setSimulations] = useState<SimulationYields>()
  const yields = getYields()

  const fees = gasEstimation?.usdValue.div(quotePrice)

  useEffect(() => {
    if (yields && amount) {
      setSimulations({
        ...calculateSimulation({
          amount,
          token,
          yields,
          fees: gasEstimation?.usdValue.div(quotePrice),
        }),
        yields,
      })
    }
  }, [fees?.toString(), amount?.toString(), token, yields])
  return simulations
}
