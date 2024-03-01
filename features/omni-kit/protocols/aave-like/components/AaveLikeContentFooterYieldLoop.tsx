import { RiskRatio } from '@oasisdex/dma-library'
import { defaultYieldFields } from 'features/aave/components'
import { useAaveEarnYields } from 'features/aave/hooks'
import { OmniOpenYieldLoopFooter } from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import React, { useMemo } from 'react'

export function AaveLikeContentFooterYieldLoop() {
  const {
    environment: { protocol, network },
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
        useAaveEarnYields(
          riskRatio,
          protocol as AaveLikeLendingProtocol,
          network.name,
          defaultYieldFields,
        )
      }
    />
  )
}
