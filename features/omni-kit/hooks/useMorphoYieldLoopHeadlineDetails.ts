import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { useOmniYieldLoopHeadline } from 'features/omni-kit/hooks'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'

export const useYieldLoopHeadlineDetails = ({ maxRiskRatio }: { maxRiskRatio: BigNumber }) => {
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
    ltv: maxRiskRatio,
    networkId: network.id,
    protocol,
    referenceDate,
  })
  const maxYieldsOffset = useOmniEarnYields({
    actionSource: 'useAaveLikeHeadlineDetails maxYields',
    quoteTokenAddress: quoteAddress,
    collateralTokenAddress: collateralAddress,
    ltv: maxRiskRatio,
    networkId: network.id,
    protocol,
    referenceDate: referenceDateOffset,
  })

  const { headlineDetails, isLoading } = useOmniYieldLoopHeadline({
    maxYields,
    maxYieldsOffset,
    minYields,
  })

  return {
    headlineDetails,
    isLoading,
  }
}
