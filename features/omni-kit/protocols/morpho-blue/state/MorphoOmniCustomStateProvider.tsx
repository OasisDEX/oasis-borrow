import type { AjnaEarnPosition, MorphoPosition } from '@oasisdex/dma-library'
import type { OmniCustomStateParams } from 'features/omni-kit/controllers'
import { AjnaCustomStateContextProvider } from 'features/omni-kit/protocols/ajna/contexts'
import { getEarnDefaultPrice } from 'features/omni-kit/protocols/ajna/helpers'
import { useAjnaOmniTxHandler } from 'features/omni-kit/protocols/ajna/hooks'
import { useMorphoMetadata } from 'features/omni-kit/protocols/morpho-blue/metadata'
import type { MorphoPositionAuction } from 'features/omni-kit/protocols/morpho-blue/types'
import { OmniProductType } from 'features/omni-kit/types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import type { FC } from 'react'
import React from 'react'

type MorphoOmniCustomStateProviderProps = OmniCustomStateParams<
  MorphoPositionAuction,
  PositionHistoryEvent[],
  MorphoPosition
>

export const MorphoOmniCustomStateProvider: FC<MorphoOmniCustomStateProviderProps> = ({
  children,
  dpmPosition,
  positionData,
}) => {
  return (
    // TO BE REMOVED / REPLACED ONCE morpho tx handler will be ready
    <AjnaCustomStateContextProvider
      price={
        dpmPosition.product === OmniProductType.Earn
          ? getEarnDefaultPrice(positionData as unknown as AjnaEarnPosition)
          : undefined
      }
    >
      {children({
        useDynamicMetadata: useMorphoMetadata,
        useTxHandler: useAjnaOmniTxHandler,
      })}
    </AjnaCustomStateContextProvider>
  )
}
