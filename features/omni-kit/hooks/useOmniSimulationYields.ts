import type BigNumber from 'bignumber.js'
import type { CalculateSimulationResult } from 'features/aave/open/services'
import { calculateSimulation } from 'features/aave/open/services'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import type { AaveLikeYieldsResponse } from 'lendingProtocols/aave-like-common'
import { useMemo } from 'react'

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
  const {
    form: {
      state: { depositAmount },
    },
    position: { isSimulationLoading },
  } = useOmniProductContext(OmniProductType.Multiply)
  const yields = getYields()

  const fees = gasEstimation?.usdValue.div(quotePrice)

  const simulations = useMemo(() => {
    if (yields && amount) {
      return {
        ...calculateSimulation({
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
