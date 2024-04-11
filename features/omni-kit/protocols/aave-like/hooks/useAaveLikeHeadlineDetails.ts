import type { IRiskRatio } from '@oasisdex/dma-library'
import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { useAaveTvl } from 'features/aave/hooks'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { useOmniYieldLoopHeadline } from 'features/omni-kit/hooks'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import { isAaveLikeLendingProtocol } from 'lendingProtocols'

export const useAaveLikeHeadlineDetails = ({ maxRiskRatio }: { maxRiskRatio: IRiskRatio }) => {
  const {
    environment: { protocol, isYieldLoopWithData, isOpening, network, quoteToken, collateralToken },
  } = useOmniGeneralContext()

  if (!(isYieldLoopWithData && isOpening)) {
    return { headlineDetails: [], isLoading: false }
  }

  if (!isAaveLikeLendingProtocol(protocol)) {
    throw Error('Given protocol is not aave-like')
  }

  const minRiskRatio = new RiskRatio(new BigNumber(1.1), RiskRatio.TYPE.MULITPLE)

  const minYields = useOmniEarnYields({
    quoteToken,
    collateralToken,
    ltv: minRiskRatio.loanToValue,
    network: network.name,
    protocol,
  })
  const maxYields = useOmniEarnYields({
    quoteToken,
    collateralToken,
    ltv: maxRiskRatio.loanToValue,
    network: network.name,
    protocol,
  })

  const tvlData = useAaveTvl(protocol, network.name)

  const { headlineDetails, isLoading } = useOmniYieldLoopHeadline({ maxYields, minYields, tvlData })

  return {
    headlineDetails,
    isLoading,
  }
}
