import { OmniOpenYieldLoopFooter } from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import { OmniProductType } from 'features/omni-kit/types'
import React, { useMemo } from 'react'

export function MorphoContentFooterYieldLoop() {
  const {
    environment: {
      protocol,
      network,
      quoteAddress,
      collateralAddress,
      quoteToken,
      collateralToken,
    },
  } = useOmniGeneralContext()
  const {
    position: {
      currentPosition: { position, simulation },
    },
  } = useOmniProductContext(OmniProductType.Multiply)

  const ltv = useMemo(() => {
    return position.maxRiskRatio.loanToValue || simulation?.maxRiskRatio.loanToValue
  }, [position.maxRiskRatio.loanToValue, simulation?.maxRiskRatio.loanToValue])

  return (
    <OmniOpenYieldLoopFooter
      getYields={() =>
        useOmniEarnYields({
          actionSource: 'MorphoContentFooterYieldLoop',
          quoteTokenAddress: quoteAddress,
          collateralTokenAddress: collateralAddress,
          quoteToken: quoteToken,
          collateralToken: collateralToken,
          ltv,
          networkId: network.id,
          protocol,
          referenceDate: new Date(),
        })
      }
    />
  )
}
