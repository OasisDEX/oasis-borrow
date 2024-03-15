import type { Erc4626Position } from '@oasisdex/dma-library'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { Erc4626VaultAllocation } from 'features/omni-kit/protocols/erc-4626/components'
import { OmniProductType } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

export const Erc4626DetailsSectionContentAllocation: FC = () => {
  const {
    environment: { quotePrice, quoteToken },
  } = useOmniGeneralContext()
  const {
    position: { currentPosition },
  } = useOmniProductContext(OmniProductType.Earn)

  const position = currentPosition.position as Erc4626Position

  return (
    <>
      {position.allocations && position.allocations.length > 0 && (
        <Erc4626VaultAllocation
          supplyTokenPrice={quotePrice}
          supplyTokenSymbol={quoteToken}
          tokens={position.allocations.map(({ supply, token, riskRatio }) => ({
            supply,
            tokenSymbol: token,
            maxLtv: riskRatio?.loanToValue,
          }))}
        />
      )}
    </>
  )
}
