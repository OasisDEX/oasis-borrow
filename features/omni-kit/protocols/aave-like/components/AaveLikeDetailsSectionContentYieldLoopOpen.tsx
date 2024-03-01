import { RiskRatio } from '@oasisdex/dma-library'
import { defaultYieldFields } from 'features/aave/components'
import { useSimulationYields } from 'features/aave/hooks'
import type { IStrategyConfig } from 'features/aave/types'
import { OmniOpenYieldLoopSimulation } from 'features/omni-kit/components/details-section'
import {
  omniYieldLoopDefaultSimulationDeposit,
  omniYieldLoopMaxRiskLtvDefaultOffset,
} from 'features/omni-kit/constants'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import type { OmniProductType } from 'features/omni-kit/types'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import type { FC } from 'react'
import React, { useMemo } from 'react'

export const AaveLikeDetailsSectionContentYieldLoopOpen: FC = () => {
  const {
    environment: { productType, quotePrice, quoteToken, protocol, network, gasEstimation },
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

  const simulations = useSimulationYields({
    amount,
    riskRatio,
    fields: defaultYieldFields,
    token: quoteToken,
    strategy: {
      protocol: protocol as AaveLikeLendingProtocol,
      network: network.name,
    } as IStrategyConfig,
    fees: gasEstimation?.usdValue.div(quotePrice),
  })

  return <OmniOpenYieldLoopSimulation simulations={simulations} />
}
