import type { AjnaEarnPosition, LendingPosition, MorphoPosition } from '@oasisdex/dma-library'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { getEarnDefaultPrice } from 'features/ajna/positions/earn/helpers/getEarnDefaultPrice'
import type { MorphoPositionAuction } from 'features/morpho/common/types'
import { OmniProductContextProvider } from 'features/omni-kit/contexts/OmniProductContext'
import { OmniBorrowPositionController } from 'features/omni-kit/controllers/borrow/OmniBorrowPositionController'
import { OmniMultiplyPositionController } from 'features/omni-kit/controllers/multiply/OmniMultiplyPositionController'
import { AjnaCustomStateContextProvider } from 'features/omni-kit/protocols/ajna/contexts/AjnaCustomStateContext'
import { useAjnaOmniTxHandler } from 'features/omni-kit/protocols/ajna/hooks/useAjnaOmniTxHandler'
import { useMorphoMetadata } from 'features/omni-kit/protocols/morpho-blue/metadata/useMorphoMetadata'
import { useOmniBorrowFormReducto } from 'features/omni-kit/state/borrow/borrowFormReducto'
import { useOmniMultiplyFormReducto } from 'features/omni-kit/state/multiply/multiplyFormReducto'
import {
  OmniBorrowFormAction,
  OmniMultiplyFormAction,
  OmniProductType,
} from 'features/omni-kit/types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import type { FC } from 'react'
import React from 'react'

interface MorphoProductControllerProps {
  aggregatedData: {
    auction: MorphoPositionAuction
    history: PositionHistoryEvent[]
  }
  dpmPosition: DpmPositionData
  isOpening: boolean
  positionData: MorphoPosition
}

export const MorphoProductController: FC<MorphoProductControllerProps> = ({
  aggregatedData: { auction, history },
  dpmPosition,
  isOpening,
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
      {dpmPosition.product === OmniProductType.Borrow && (
        <OmniProductContextProvider
          getDynamicMetadata={useMorphoMetadata}
          formDefaults={{
            action: isOpening
              ? OmniBorrowFormAction.OpenBorrow
              : OmniBorrowFormAction.DepositBorrow,
          }}
          formReducto={useOmniBorrowFormReducto}
          position={positionData as LendingPosition}
          productType={dpmPosition.product}
          positionAuction={auction}
          positionHistory={history}
        >
          <OmniBorrowPositionController txHandler={useAjnaOmniTxHandler} />
        </OmniProductContextProvider>
      )}
      {dpmPosition.product === OmniProductType.Multiply && (
        <OmniProductContextProvider
          getDynamicMetadata={useMorphoMetadata}
          formDefaults={{
            action: isOpening
              ? OmniMultiplyFormAction.OpenMultiply
              : OmniMultiplyFormAction.AdjustMultiply,
          }}
          formReducto={useOmniMultiplyFormReducto}
          position={positionData as LendingPosition}
          productType={dpmPosition.product}
          positionAuction={auction}
          positionHistory={history}
        >
          <OmniMultiplyPositionController txHandler={useAjnaOmniTxHandler} />
        </OmniProductContextProvider>
      )}
    </AjnaCustomStateContextProvider>
  )
}
