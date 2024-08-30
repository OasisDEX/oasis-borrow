import type BigNumber from 'bignumber.js'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { useOmniYieldLoopHeadline } from 'features/omni-kit/hooks'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'

export const useYieldLoopHeadlineDetails = ({
  ltv,
  poolAddress,
}: {
  ltv: BigNumber
  poolAddress?: string
}) => {
  const {
    environment: {
      protocol,
      isYieldLoopWithData,
      network,
      quoteAddress,
      collateralAddress,
      collateralToken,
      quoteToken,
    },
  } = useOmniGeneralContext()

  if (!isYieldLoopWithData) {
    return { headlineDetails: [], isLoading: false }
  }

  const referenceDate = new Date()
  const referenceDateOffset = new Date(new Date().setDate(referenceDate.getDate() - 1))

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
    poolAddress,
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
    poolAddress,
  })

  const { headlineDetails, isLoading } = useOmniYieldLoopHeadline({
    maxYields,
    maxYieldsOffset,
  })

  return {
    headlineDetails,
    isLoading,
  }
}
