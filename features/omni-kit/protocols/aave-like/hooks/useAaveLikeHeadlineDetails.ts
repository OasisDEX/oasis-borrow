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
    environment: {
      protocol,
      isYieldLoopWithData,
      isOpening,
      network,
      quoteAddress,
      collateralAddress,
    },
  } = useOmniGeneralContext()

  if (!(isYieldLoopWithData && isOpening)) {
    return { headlineDetails: [], isLoading: false }
  }

  if (!isAaveLikeLendingProtocol(protocol)) {
    throw Error('Given protocol is not aave-like')
  }

  const minRiskRatio = new RiskRatio(new BigNumber(1.1), RiskRatio.TYPE.MULITPLE)
  const referenceDate = new Date()
  const referenceDateOffset = new Date(new Date().setDate(referenceDate.getDate() - 1))

  const minYields = useOmniEarnYields({
    actionSource: 'useAaveLikeHeadlineDetails minYields',
    quoteTokenAddress: quoteAddress,
    collateralTokenAddress: collateralAddress,
    ltv: minRiskRatio.loanToValue,
    networkId: network.id,
    protocol,
    referenceDate,
  })
  const maxYields = useOmniEarnYields({
    actionSource: 'useAaveLikeHeadlineDetails maxYields',
    quoteTokenAddress: quoteAddress,
    collateralTokenAddress: collateralAddress,
    ltv: maxRiskRatio.loanToValue,
    networkId: network.id,
    protocol,
    referenceDate,
  })
  const maxYieldsOffset = useOmniEarnYields({
    actionSource: 'useAaveLikeHeadlineDetails maxYields',
    quoteTokenAddress: quoteAddress,
    collateralTokenAddress: collateralAddress,
    ltv: maxRiskRatio.loanToValue,
    networkId: network.id,
    protocol,
    referenceDate: referenceDateOffset,
  })

  const tvlData = useAaveTvl(protocol, network.name)

  const { headlineDetails, isLoading } = useOmniYieldLoopHeadline({
    maxYields,
    maxYieldsOffset,
    minYields,
    tvlData,
  })

  return {
    headlineDetails,
    isLoading,
  }
}
