import { omniDefaultOverviewSimulationDeposit } from 'features/omni-kit/constants'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { resolveIfCachedPosition } from 'features/omni-kit/protocols/ajna/helpers'
import { Erc4626PseudoProtocol } from 'features/omni-kit/protocols/morpho-blue/constants'

export function useOmniInPositionAmount() {
  const {
    environment: { pseudoProtocol, productType },
    tx: { isTxSuccess },
  } = useOmniGeneralContext()
  const {
    form: {
      state: { depositAmount, pullToken },
    },
    position: { cachedPosition, currentPosition, isSimulationLoading },
  } = useOmniProductContext(productType)

  if (pseudoProtocol === Erc4626PseudoProtocol && pullToken) {
    const { simulationData } = resolveIfCachedPosition({
      cached: isTxSuccess,
      cachedPosition,
      currentPosition,
    })

    if (isSimulationLoading) return undefined
    else
      return simulationData && 'quoteTokenAmount' in simulationData
        ? simulationData.quoteTokenAmount
        : omniDefaultOverviewSimulationDeposit
  }

  return depositAmount ?? omniDefaultOverviewSimulationDeposit
}
