import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { defaultYieldFields } from 'features/aave/components'
import { useSimulationYields } from 'features/aave/hooks'
import type { IStrategyConfig } from 'features/aave/types'
import {
  OmniContentCard,
  useOmniCardDataApy,
  useOmniCardDataBreakEven,
  useOmniCardDataEntryFees,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import React, { useMemo } from 'react'

export function AaveLikeContentFooterYieldLoop() {
  const {
    environment: { quoteToken, protocol, network, gasEstimation, quotePrice },
  } = useOmniGeneralContext()
  const {
    position: {
      isSimulationLoading,
      currentPosition: { position, simulation },
    },
    form: {
      state: { depositAmount },
    },
  } = useOmniProductContext(OmniProductType.Multiply)

  const defaultRiskRatio = new RiskRatio(
    position.maxRiskRatio.loanToValue.minus(0.02),
    RiskRatio.TYPE.LTV,
  )

  const amount = useMemo(() => depositAmount || new BigNumber(100), [depositAmount])

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

  const breakEvenContentCardCommonData = useOmniCardDataBreakEven({
    isSimulationLoading,
    breakEven: simulations?.breakEven,
  })
  const entryFeesContentCardCommonData = useOmniCardDataEntryFees({
    isSimulationLoading,
    entryFees: simulations?.entryFees,
    token: quoteToken,
  })
  const apyContentCardCommonData = useOmniCardDataApy({
    apy: simulations?.apy?.div(100),
    isSimulationLoading,
  })

  return (
    <>
      <OmniContentCard asFooter {...breakEvenContentCardCommonData} />
      <OmniContentCard asFooter {...entryFeesContentCardCommonData} />
      <OmniContentCard asFooter {...apyContentCardCommonData} />
    </>
  )
}
