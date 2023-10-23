import type { AjnaEarnPosition, LendingPosition, MorphoPosition } from '@oasisdex/dma-library'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { getEarnDefaultPrice } from 'features/ajna/positions/earn/helpers/getEarnDefaultPrice'
import type { MorphoPositionAuction } from 'features/morpho/common/types'
import { AjnaCustomStateContextProvider } from 'features/omni-kit/contexts/custom/AjnaCustomStateContext'
import { OmniProductContextProvider } from 'features/omni-kit/contexts/OmniProductContext'
import { OmniBorrowPositionController } from 'features/omni-kit/controllers/borrow/OmniBorrowPositionController'
import { OmniMultiplyPositionController } from 'features/omni-kit/controllers/multiply/OmniMultiplyPositionController'
import { useAjnaOmniTxHandler } from 'features/omni-kit/hooks/ajna/useAjnaOmniTxHandler'
import { useMorphoMetadata } from 'features/omni-kit/metadata/morpho/useMorphoMetadata'
import { useOmniBorrowFormReducto } from 'features/omni-kit/state/borrow/borrowFormReducto'
import { useOmniMultiplyFormReducto } from 'features/omni-kit/state/multiply/multiplyFormReducto'
import type { OmniFlow } from 'features/omni-kit/types/common.types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import type { FC } from 'react'
import React from 'react'

interface MorphoProductControllerProps {
  flow: OmniFlow
  dpmPosition: DpmPositionData
  aggregatedData: { auction: MorphoPositionAuction; history: PositionHistoryEvent[] }
  positionData: MorphoPosition
}

export const MorphoProductController: FC<MorphoProductControllerProps> = ({
  dpmPosition,
  flow,
  aggregatedData: { auction, history },
  positionData,
}) => {
  return (
    // TO BE REMOVED / REPLACED ONCE morpho tx handler will be ready
    <AjnaCustomStateContextProvider
      price={
        dpmPosition.product === 'earn'
          ? getEarnDefaultPrice(positionData as unknown as AjnaEarnPosition)
          : undefined
      }
    >
      {dpmPosition.product === 'borrow' && (
        <OmniProductContextProvider
          dynamicMetadata={useMorphoMetadata}
          formDefaults={{
            action: flow === 'open' ? 'open-borrow' : 'deposit-borrow',
          }}
          formReducto={useOmniBorrowFormReducto}
          position={positionData as LendingPosition}
          product={dpmPosition.product}
          positionAuction={auction}
          positionHistory={history}
        >
          <OmniBorrowPositionController txHandler={useAjnaOmniTxHandler} />
        </OmniProductContextProvider>
      )}
      {dpmPosition.product === 'multiply' && (
        <OmniProductContextProvider
          dynamicMetadata={useMorphoMetadata}
          formDefaults={{
            action: flow === 'open' ? 'open-multiply' : 'adjust',
          }}
          formReducto={useOmniMultiplyFormReducto}
          position={positionData as LendingPosition}
          product={dpmPosition.product}
          positionAuction={auction}
          positionHistory={history}
        >
          <OmniMultiplyPositionController txHandler={useAjnaOmniTxHandler} />
        </OmniProductContextProvider>
      )}
    </AjnaCustomStateContextProvider>
  )
}
