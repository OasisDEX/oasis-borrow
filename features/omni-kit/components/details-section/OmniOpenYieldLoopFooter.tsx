import {
  OmniContentCard,
  useOmniCardDataApy,
  useOmniCardDataBreakEven,
  useOmniCardDataEntryFees,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniSimulationYields } from 'features/omni-kit/hooks'
import { OmniProductType } from 'features/omni-kit/types'
import type { GetYieldsResponseMapped } from 'helpers/lambda/yields'
import { hundred } from 'helpers/zero'
import type { FC } from 'react'
import React, { useMemo } from 'react'

interface AaveLikeContentFooterYieldLoopProps {
  getYields: () => GetYieldsResponseMapped | undefined
}

export const OmniOpenYieldLoopFooter: FC<AaveLikeContentFooterYieldLoopProps> = ({ getYields }) => {
  const {
    environment: { quoteToken },
  } = useOmniGeneralContext()
  const {
    position: { isSimulationLoading },
    form: {
      state: { depositAmount },
    },
  } = useOmniProductContext(OmniProductType.Multiply)

  const amount = useMemo(() => depositAmount || hundred, [depositAmount])

  const simulations = useOmniSimulationYields({
    amount,
    token: quoteToken,
    getYields,
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
