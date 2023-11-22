import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type { OmniCustomStateParams } from 'features/omni-kit/controllers'
import { AjnaCustomStateContextProvider } from 'features/omni-kit/protocols/ajna/contexts'
import {
  getAjnaOmniEarnDefaultAction,
  getAjnaOmniEarnDefaultUiDropdown,
  getEarnDefaultPrice,
} from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaUnifiedHistoryEvent } from 'features/omni-kit/protocols/ajna/history'
import { useAjnaOmniTxHandler } from 'features/omni-kit/protocols/ajna/hooks'
import { useAjnaMetadata } from 'features/omni-kit/protocols/ajna/metadata'
import type { AjnaPositionAuction } from 'features/omni-kit/protocols/ajna/observables'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'
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
