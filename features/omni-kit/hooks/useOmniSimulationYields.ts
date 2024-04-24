import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import type { CalculateSimulationResult } from 'features/omni-kit/helpers/calculateOmniYieldsSimulation'
import { calculateOmniYieldsSimulation } from 'features/omni-kit/helpers/calculateOmniYieldsSimulation'
import { OmniProductType } from 'features/omni-kit/types'
import type { GetYieldsResponseMapped } from 'helpers/lambda/yields'
import { thousand } from 'helpers/zero'
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
    environment: { gasEstimation, quotePrice, gasPrice },
  } = useOmniGeneralContext()
  const {
    position: { isSimulationLoading },
  } = useOmniProductContext(OmniProductType.Multiply)
  const yields = getYields()

  const fees = gasEstimation?.usdValue.div(quotePrice)
  // estimated fees for simulation
  // 3 million gas * gasPrice
  const simulationFees = amountFromWei(
    new BigNumber(3).times(thousand).times(thousand).times(gasPrice.maxFeePerGas),
  )

  const simulations = useMemo(() => {
    if (yields && amount) {
      return {
        ...calculateOmniYieldsSimulation({
          amount,
          token,
          yields,
          fees: gasEstimation?.usdValue.eq(0) ? simulationFees : fees,
        }),
        yields,
      }
    }
    return undefined
  }, [fees?.toString(), simulationFees.toString(), amount?.toString(), token, yields])

  return isSimulationLoading ? undefined : simulations
}
