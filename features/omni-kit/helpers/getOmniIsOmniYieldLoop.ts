import { isCorrelatedPosition } from '@oasisdex/dma-library'
import { Erc4626PseudoProtocol } from 'features/omni-kit/protocols/morpho-blue/constants'

interface GetOmniIsOmniYieldLoopParams {
  collateralToken: string
  pseudoProtocol?: string
  quoteToken: string
}

export function getOmniIsOmniYieldLoop({
  collateralToken,
  pseudoProtocol,
  quoteToken,
}: GetOmniIsOmniYieldLoopParams) {
  if (pseudoProtocol === Erc4626PseudoProtocol) return false

  return isCorrelatedPosition(collateralToken, quoteToken)
}
