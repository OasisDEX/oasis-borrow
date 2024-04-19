import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { useOmniYieldLoopHeadline } from 'features/omni-kit/hooks'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'

export const useYieldLoopHeadlineDetails = ({ ltv }: { ltv: BigNumber }) => {
  const {
    environment: {
      protocol,
      isYieldLoopWithData,
      isOpening,
      network,
      quoteAddress,
      collateralAddress,
      collateralToken,
      quoteToken,
    },
  } = useOmniGeneralContext()

  if (!(isYieldLoopWithData && isOpening)) {
    return { headlineDetails: [], isLoading: false }
  }

  const minRiskRatio = new RiskRatio(new BigNumber(1.1), RiskRatio.TYPE.MULITPLE)
  const referenceDate = new Date()
  const referenceDateOffset = new Date(new Date().setDate(referenceDate.getDate() - 1))

  const minYields = useOmniEarnYields({
    actionSource: 'useYieldLoopHeadlineDetails minYields',
    quoteTokenAddress: quoteAddress,
    collateralTokenAddress: collateralAddress,
    quoteToken: quoteToken,
    collateralToken: collateralToken,
    ltv: minRiskRatio.loanToValue,
    networkId: network.id,
    protocol,
    referenceDate,
  })
  const maxYields = useOmniEarnYields({
    actionSource: 'useYieldLoopHeadlineDetails maxYields',
    quoteTokenAddress: quoteAddress,
    collateralTokenAddress: collateralAddress,
    quoteToken: quoteToken,
    collateralToken: collateralToken,
    ltv,
    networkId: network.id,
    protocol,
    referenceDate,
  })
  const maxYieldsOffset = useOmniEarnYields({
    actionSource: 'useYieldLoopHeadlineDetails maxYields',
    quoteTokenAddress: quoteAddress,
    collateralTokenAddress: collateralAddress,
    quoteToken: quoteToken,
    collateralToken: collateralToken,
    ltv,
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
