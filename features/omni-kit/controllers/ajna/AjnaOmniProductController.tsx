import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import type { AjnaUnifiedHistoryEvent } from 'features/ajna/history/ajnaUnifiedHistoryEvent'
import type { AjnaPositionAuction } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { AjnaEarnPositionController } from 'features/ajna/positions/earn/controls/AjnaEarnPositionController'
import { getAjnaEarnDefaultAction } from 'features/ajna/positions/earn/helpers/getAjnaEarnDefaultAction'
import { getAjnaEarnDefaultUiDropdown } from 'features/ajna/positions/earn/helpers/getAjnaEarnDefaultUiDropdown'
import { getEarnDefaultPrice } from 'features/ajna/positions/earn/helpers/getEarnDefaultPrice'
import { AjnaCustomStateContextProvider } from 'features/omni-kit/contexts/custom/AjnaCustomStateContext'
import { OmniProductContextProvider } from 'features/omni-kit/contexts/OmniProductContext'
import { OmniBorrowPositionController } from 'features/omni-kit/controllers/borrow/OmniBorrowPositionController'
import { OmniMultiplyPositionController } from 'features/omni-kit/controllers/multiply/OmniMultiplyPositionController'
import { useAjnaMetadata } from 'features/omni-kit/metadata/ajna/useAjnaMetadata'
import { useOmniBorrowFormReducto } from 'features/omni-kit/state/borrow/borrowFormReducto'
import { useOmniEarnFormReducto } from 'features/omni-kit/state/earn/earnFormReducto'
import { useOmniMultiplyFormReducto } from 'features/omni-kit/state/multiply/multiplyFormReducto'
import type { OmniFlow } from 'features/omni-kit/types/common.types'
import type { FC } from 'react'
import React from 'react'

interface AjnaOmniProductControllerProps {
  flow: OmniFlow
  dpmPosition: DpmPositionData
  aggregatedData: { auction: AjnaPositionAuction; history: AjnaUnifiedHistoryEvent[] }
  positionData: AjnaGenericPosition
}

export const AjnaOmniProductController: FC<AjnaOmniProductControllerProps> = ({
  dpmPosition,
  flow,
  aggregatedData: { auction, history },
  positionData,
}) => {
  return (
    <>
      {dpmPosition.product === 'borrow' && (
        <AjnaCustomStateContextProvider>
          <OmniProductContextProvider
            dynamicMetadata={useAjnaMetadata}
            formDefaults={{
              action: flow === 'open' ? 'open-borrow' : 'deposit-borrow',
            }}
            formReducto={useOmniBorrowFormReducto}
            position={positionData as AjnaPosition}
            product={dpmPosition.product}
            positionAuction={auction}
            positionHistory={history}
          >
            <OmniBorrowPositionController />
          </OmniProductContextProvider>
        </AjnaCustomStateContextProvider>
      )}
      {dpmPosition.product === 'earn' && (
        <AjnaCustomStateContextProvider>
          <OmniProductContextProvider
            dynamicMetadata={useAjnaMetadata}
            formDefaults={{
              action: getAjnaEarnDefaultAction(flow, positionData as AjnaEarnPosition),
              uiDropdown: getAjnaEarnDefaultUiDropdown(positionData as AjnaEarnPosition),
              price: getEarnDefaultPrice(positionData as AjnaEarnPosition),
            }}
            formReducto={useOmniEarnFormReducto}
            position={positionData as AjnaEarnPosition}
            product={dpmPosition.product}
            positionAuction={auction}
            positionHistory={history}
          >
            <AjnaEarnPositionController />
          </OmniProductContextProvider>
        </AjnaCustomStateContextProvider>
      )}
      {dpmPosition.product === 'multiply' && (
        <AjnaCustomStateContextProvider>
          <OmniProductContextProvider
            dynamicMetadata={useAjnaMetadata}
            formDefaults={{
              action: flow === 'open' ? 'open-multiply' : 'adjust',
            }}
            formReducto={useOmniMultiplyFormReducto}
            position={positionData as AjnaPosition}
            product={dpmPosition.product}
            positionAuction={auction}
            positionHistory={history}
          >
            <OmniMultiplyPositionController />
          </OmniProductContextProvider>
        </AjnaCustomStateContextProvider>
      )}
    </>
  )
}
