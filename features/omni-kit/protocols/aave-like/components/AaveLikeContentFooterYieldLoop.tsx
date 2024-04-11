import { RiskRatio } from '@oasisdex/dma-library'
import { OmniOpenYieldLoopFooter } from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import { OmniProductType } from 'features/omni-kit/types'
import React, { useMemo } from 'react'

export function AaveLikeContentFooterYieldLoop() {
  const {
    environment: { protocol, network, quoteToken, collateralToken },
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

  const riskRatio = useMemo(
    () => simulation?.riskRatio || defaultRiskRatio,
    [defaultRiskRatio, simulation],
  )

  return (
    <OmniOpenYieldLoopFooter
      getYields={() =>
        useOmniEarnYields({
          quoteToken,
          collateralToken,
          ltv: riskRatio.loanToValue,
          network: network.name,
          protocol,
        })
      }
    />
  )
}
