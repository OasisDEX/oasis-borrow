import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import type { AjnaUnifiedHistoryEvent } from 'features/ajna/history/ajnaUnifiedHistoryEvent'
import type { AjnaPositionAuction } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import { getEarnDefaultPrice } from 'features/ajna/positions/earn/helpers/getEarnDefaultPrice'
import type { OmniCustomStateParams } from 'features/omni-kit/controllers'
import { AjnaCustomStateContextProvider } from 'features/omni-kit/protocols/ajna/contexts/AjnaCustomStateContext'
import { getAjnaOmniEarnDefaultAction } from 'features/omni-kit/protocols/ajna/helpers/getAjnaOmniEarnDefaultAction'
import { getAjnaOmniEarnDefaultUiDropdown } from 'features/omni-kit/protocols/ajna/helpers/getAjnaOmniEarnDefaultUiDropdown'
import { useAjnaOmniTxHandler } from 'features/omni-kit/protocols/ajna/hooks/useAjnaOmniTxHandler'
import { useAjnaMetadata } from 'features/omni-kit/protocols/ajna/metadata/useAjnaMetadata'
import { OmniProductType } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

type MorphoOmniCustomStateProviderProps = OmniCustomStateParams<
  AjnaPositionAuction,
  AjnaUnifiedHistoryEvent[],
  AjnaGenericPosition
>

export const AjnaOmniCustomStateProvider: FC<MorphoOmniCustomStateProviderProps> = ({
  children,
  dpmPosition,
  isOpening,
  positionData,
}) => {
  const formDefaults = {
    borrow: {},
    earn: {
      ...(dpmPosition.product === OmniProductType.Earn && {
        action: getAjnaOmniEarnDefaultAction(isOpening, positionData as AjnaEarnPosition),
        uiDropdown: getAjnaOmniEarnDefaultUiDropdown(positionData as AjnaEarnPosition),
      }),
    },
    multiply: {},
  }

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
        useDynamicMetadata: useAjnaMetadata,
        useTxHandler: useAjnaOmniTxHandler,
        formDefaults,
      })}
    </AjnaCustomStateContextProvider>
  )
}
