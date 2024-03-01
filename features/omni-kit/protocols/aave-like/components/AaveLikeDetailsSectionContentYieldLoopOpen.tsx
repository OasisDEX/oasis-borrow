import { RiskRatio } from '@oasisdex/dma-library'
import { defaultYieldFields } from 'features/aave/components'
import { useAaveEarnYields } from 'features/aave/hooks'
import { OmniOpenYieldLoopSimulation } from 'features/omni-kit/components/details-section'
import {
  omniYieldLoopDefaultSimulationDeposit,
  omniYieldLoopMaxRiskLtvDefaultOffset,
} from 'features/omni-kit/constants'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniSimulationYields } from 'features/omni-kit/hooks'
import type { OmniProductType } from 'features/omni-kit/types'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import type { FC } from 'react'
import React, { useMemo } from 'react'

export const AaveLikeDetailsSectionContentYieldLoopOpen: FC = () => {
  const {
    environment: { productType, quoteToken, protocol, network },
  } = useOmniGeneralContext()
  const {
    position: {
      currentPosition: { position, simulation },
    },
    form: {
      state: { depositAmount },
    },
  } = useOmniProductContext(productType as OmniProductType.Borrow | OmniProductType.Multiply)

  const amount = useMemo(
    () => depositAmount || omniYieldLoopDefaultSimulationDeposit,
    [depositAmount],
  )

  // It's simplified version of whole aave-like default risk ratio config
  const defaultRiskRatio = new RiskRatio(
    position.maxRiskRatio.loanToValue.minus(omniYieldLoopMaxRiskLtvDefaultOffset),
    RiskRatio.TYPE.LTV,
  )

  const riskRatio = useMemo(
    () => simulation?.riskRatio || defaultRiskRatio,
    [defaultRiskRatio, simulation],
  )

  const simulations = useOmniSimulationYields({
    amount,
    token: quoteToken,
    getYields: () =>
      useAaveEarnYields(
        riskRatio,
        protocol as AaveLikeLendingProtocol,
        network.name,
        defaultYieldFields,
      ),
  })

  return <OmniOpenYieldLoopSimulation simulations={simulations} />
}
