import { OmniOpenYieldLoopSimulation } from 'features/omni-kit/components/details-section'
import { omniDefaultOverviewSimulationDeposit } from 'features/omni-kit/constants'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniSimulationYields } from 'features/omni-kit/hooks'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import type { OmniProductType } from 'features/omni-kit/types'
import type { FC } from 'react'
import React, { useMemo } from 'react'

export const MorphoDetailsSectionContentYieldLoopOpen: FC = () => {
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

  const ltv = useMemo(() => {
    return position.maxRiskRatio.loanToValue || simulation?.maxRiskRatio.loanToValue
  }, [position.maxRiskRatio.loanToValue, simulation?.maxRiskRatio.loanToValue])

  const simulations = useOmniSimulationYields({
    amount,
    token: quoteToken,
    getYields: () =>
      useOmniEarnYields({
        actionSource: 'MorphoDetailsSectionContentYieldLoopOpen',
        quoteTokenAddress: quoteAddress,
        collateralTokenAddress: collateralAddress,
        quoteToken: quoteToken,
        collateralToken: collateralToken,
        ltv,
        networkId: network.id,
        protocol,
      }),
  })

  return <OmniOpenYieldLoopSimulation simulations={simulations} />
}
