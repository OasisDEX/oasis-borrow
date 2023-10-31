import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import type { AjnaUnifiedHistoryEvent } from 'features/ajna/history/ajnaUnifiedHistoryEvent'
import type { AjnaPositionAuction } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { getEarnDefaultPrice } from 'features/ajna/positions/earn/helpers/getEarnDefaultPrice'
import { OmniProductContextProvider } from 'features/omni-kit/contexts/OmniProductContext'
import { OmniBorrowPositionController } from 'features/omni-kit/controllers/borrow/OmniBorrowPositionController'
import { OmniEarnPositionController } from 'features/omni-kit/controllers/earn/OmniEarnPositionController'
import { OmniMultiplyPositionController } from 'features/omni-kit/controllers/multiply/OmniMultiplyPositionController'
import { AjnaCustomStateContextProvider } from 'features/omni-kit/protocols/ajna/contexts/AjnaCustomStateContext'
import { getAjnaOmniEarnDefaultAction } from 'features/omni-kit/protocols/ajna/helpers/getAjnaOmniEarnDefaultAction'
import { getAjnaOmniEarnDefaultUiDropdown } from 'features/omni-kit/protocols/ajna/helpers/getAjnaOmniEarnDefaultUiDropdown'
import { useAjnaOmniTxHandler } from 'features/omni-kit/protocols/ajna/hooks/useAjnaOmniTxHandler'
import { useAjnaMetadata } from 'features/omni-kit/protocols/ajna/metadata/useAjnaMetadata'
import { useOmniBorrowFormReducto } from 'features/omni-kit/state/borrow/borrowFormReducto'
import { useOmniEarnFormReducto } from 'features/omni-kit/state/earn/earnFormReducto'
import { useOmniMultiplyFormReducto } from 'features/omni-kit/state/multiply/multiplyFormReducto'
import {
  OmniBorrowFormAction,
  OmniMultiplyFormAction,
  OmniProductType,
} from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

interface AjnaOmniProductControllerProps {
  aggregatedData: {
    auction: AjnaPositionAuction
    history: AjnaUnifiedHistoryEvent[]
  }
  dpmPosition: DpmPositionData
  isOpening: boolean
  positionData: AjnaGenericPosition
}

export const AjnaOmniProductController: FC<AjnaOmniProductControllerProps> = ({
  aggregatedData: { auction, history },
  dpmPosition,
  isOpening,
  positionData,
}) => {
  return (
    <AjnaCustomStateContextProvider
      price={
        dpmPosition.product === OmniProductType.Earn
          ? getEarnDefaultPrice(positionData as AjnaEarnPosition)
          : undefined
      }
    >
      {dpmPosition.product === OmniProductType.Borrow && (
        <OmniProductContextProvider
          getDynamicMetadata={useAjnaMetadata}
          formDefaults={{
            action: isOpening
              ? OmniBorrowFormAction.OpenBorrow
              : OmniBorrowFormAction.DepositBorrow,
          }}
          formReducto={useOmniBorrowFormReducto}
          position={positionData as AjnaPosition}
          productType={dpmPosition.product}
          positionAuction={auction}
          positionHistory={history}
        >
          <OmniBorrowPositionController txHandler={useAjnaOmniTxHandler} />
        </OmniProductContextProvider>
      )}
      {dpmPosition.product === OmniProductType.Earn && (
        <OmniProductContextProvider
          getDynamicMetadata={useAjnaMetadata}
          formDefaults={{
            action: getAjnaOmniEarnDefaultAction(isOpening, positionData as AjnaEarnPosition),
            uiDropdown: getAjnaOmniEarnDefaultUiDropdown(positionData as AjnaEarnPosition),
          }}
          formReducto={useOmniEarnFormReducto}
          position={positionData as AjnaEarnPosition}
          productType={dpmPosition.product}
          positionAuction={auction}
          positionHistory={history}
        >
          <OmniEarnPositionController txHandler={useAjnaOmniTxHandler} />
        </OmniProductContextProvider>
      )}
      {dpmPosition.product === OmniProductType.Multiply && (
        <OmniProductContextProvider
          getDynamicMetadata={useAjnaMetadata}
          formDefaults={{
            action: isOpening
              ? OmniMultiplyFormAction.OpenMultiply
              : OmniMultiplyFormAction.AdjustMultiply,
          }}
          formReducto={useOmniMultiplyFormReducto}
          position={positionData as AjnaPosition}
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
