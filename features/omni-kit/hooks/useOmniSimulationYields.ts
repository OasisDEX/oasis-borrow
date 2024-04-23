import type BigNumber from 'bignumber.js'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import type { CalculateSimulationResult } from 'features/omni-kit/helpers/calculateOmniYieldsSimulation'
import { calculateOmniYieldsSimulation } from 'features/omni-kit/helpers/calculateOmniYieldsSimulation'
import { OmniProductType } from 'features/omni-kit/types'
import type { GetYieldsResponseMapped } from 'helpers/lambda/yields'
import { useMemo } from 'react'

type useSimulationYieldsParams = {
  amount?: BigNumber
  token: string
  getYields: () => GetYieldsResponseMapped | undefined
}

export type SimulationYields = CalculateSimulationResult & { yields: GetYieldsResponseMapped }

export function useOmniSimulationYields({
  amount,
  token,
  getYields,
}: useSimulationYieldsParams): SimulationYields | undefined {
  const {
    environment: { gasEstimation, quotePrice },
  } = useOmniGeneralContext()
  const {
    form: {
      state: { depositAmount },
    },
    position: { isSimulationLoading },
  } = useOmniProductContext(OmniProductType.Multiply)
  const yields = getYields()

  // TODO: fix this dependancy
  // it blocks the simulation from being calculated
  // if the wallet has no tokens (gasEstimation?.usdValue is zero)
  const fees = gasEstimation?.usdValue.div(quotePrice)

  const simulations = useMemo(() => {
    if (yields && amount) {
      return {
        ...calculateOmniYieldsSimulation({
          amount,
          token,
          yields,
          fees, // here we allow fees to be 0 so initial simulation works
        }),
        yields,
      }
    }
    return undefined
  }, [fees?.toString(), amount?.toString(), token, yields])

  if ((depositAmount && fees?.isZero()) || isSimulationLoading) {
    return undefined
  }

  return simulations
}
