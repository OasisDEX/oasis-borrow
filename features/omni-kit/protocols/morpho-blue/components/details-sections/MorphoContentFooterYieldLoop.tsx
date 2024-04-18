import BigNumber from 'bignumber.js'
import { OmniOpenYieldLoopFooter } from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import { OmniProductType } from 'features/omni-kit/types'
import React, { useMemo } from 'react'

export function MorphoContentFooterYieldLoop() {
  const {
    environment: { protocol, network, quoteAddress, collateralAddress },
  } = useOmniGeneralContext()
  const {
    position: {
      currentPosition: { position, simulation },
    },
  } = useOmniProductContext(OmniProductType.Multiply)

  const ltv = useMemo(() => {
    return new BigNumber(1)
  }, [])

  return (
    <OmniOpenYieldLoopFooter
      getYields={() =>
        useOmniEarnYields({
          actionSource: 'MorphoContentFooterYieldLoop',
          quoteTokenAddress: quoteAddress,
          collateralTokenAddress: collateralAddress,
          ltv,
          networkId: network.id,
          protocol,
          referenceDate: new Date(),
        })
      }
    />
  )
}
