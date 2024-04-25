import { RiskRatio } from '@oasisdex/dma-library'
import { OmniOpenYieldLoopFooter } from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import { OmniProductType } from 'features/omni-kit/types'
import React, { useMemo } from 'react'

export function AaveLikeContentFooterYieldLoop() {
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

  const defaultRiskRatio = new RiskRatio(
    position.maxRiskRatio.loanToValue.minus(0.02),
    RiskRatio.TYPE.LTV,
  )

  const ltv = useMemo(
    () => simulation?.riskRatio.loanToValue || defaultRiskRatio.loanToValue,
    [defaultRiskRatio, simulation],
  )

  return (
    <OmniOpenYieldLoopFooter
      getYields={() =>
        useOmniEarnYields({
          actionSource: 'AaveLikeContentFooterYieldLoop',
          quoteTokenAddress: quoteAddress,
          collateralTokenAddress: collateralAddress,
          quoteToken: quoteToken,
          collateralToken: collateralToken,
          ltv,
          networkId: network.id,
          protocol,
        })
      }
    />
  )
}
