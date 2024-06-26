import { OmniOpenYieldLoopSimulation } from 'features/omni-kit/components/details-section'
import { MAX_SENSIBLE_LTV, omniDefaultOverviewSimulationDeposit } from 'features/omni-kit/constants'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniSimulationYields } from 'features/omni-kit/hooks'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import type { OmniProductType } from 'features/omni-kit/types'
import type { FC } from 'react'
import React, { useMemo } from 'react'

export const OmniOpenYieldLoopDetails: FC<{ poolAddress?: string }> = ({ poolAddress }) => {
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

  const maxRiskRatio = useMemo(() => {
    if (position.maxRiskRatio.loanToValue.gt(MAX_SENSIBLE_LTV)) {
      return MAX_SENSIBLE_LTV
    }
    return position.maxRiskRatio.loanToValue
  }, [position.maxRiskRatio.loanToValue])

  const ltv = useMemo(() => {
    return simulation?.riskRatio.loanToValue || maxRiskRatio
  }, [maxRiskRatio, simulation?.riskRatio.loanToValue])

  const simulations = useOmniSimulationYields({
    amount,
    token: quoteToken,
    getYields: () =>
      useOmniEarnYields({
        actionSource: 'OmniOpenYieldLoopDetails',
        quoteTokenAddress: quoteAddress,
        collateralTokenAddress: collateralAddress,
        quoteToken: quoteToken,
        collateralToken: collateralToken,
        ltv,
        networkId: network.id,
        protocol,
        poolAddress,
      }),
  })

  return <OmniOpenYieldLoopSimulation simulations={simulations} />
}
