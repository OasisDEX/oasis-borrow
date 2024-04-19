import { RiskRatio } from '@oasisdex/dma-library'
import { OmniOpenYieldLoopSimulation } from 'features/omni-kit/components/details-section'
import {
  omniDefaultOverviewSimulationDeposit,
  omniYieldLoopMaxRiskLtvDefaultOffset,
} from 'features/omni-kit/constants'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniSimulationYields } from 'features/omni-kit/hooks'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import type { OmniProductType } from 'features/omni-kit/types'
import type { FC } from 'react'
import React, { useMemo } from 'react'

export const AaveLikeDetailsSectionContentYieldLoopOpen: FC = () => {
  const {
    environment: {
      productType,
      quoteToken,
      quoteAddress,
      collateralAddress,
      protocol,
      network,
      collateralToken,
    },
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
    () => depositAmount || omniDefaultOverviewSimulationDeposit,
    [depositAmount],
  )

  const riskRatio = useMemo(() => {
    // It's simplified version of whole aave-like default risk ratio config
    const defaultRiskRatio = new RiskRatio(
      position.maxRiskRatio.loanToValue.minus(omniYieldLoopMaxRiskLtvDefaultOffset),
      RiskRatio.TYPE.LTV,
    )
    return simulation?.riskRatio || defaultRiskRatio
  }, [position.maxRiskRatio.loanToValue, simulation?.riskRatio])

  const simulations = useOmniSimulationYields({
    amount,
    token: quoteToken,
    getYields: () =>
      useOmniEarnYields({
        actionSource: 'AaveLikeDetailsSectionContentYieldLoopOpen',
        quoteTokenAddress: quoteAddress,
        collateralTokenAddress: collateralAddress,
        quoteToken: quoteToken,
        collateralToken: collateralToken,
        ltv: riskRatio.loanToValue,
        networkId: network.id,
        protocol,
        referenceDate: new Date(),
      }),
  })

  return <OmniOpenYieldLoopSimulation simulations={simulations} />
}
