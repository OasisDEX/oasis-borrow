import type { Erc4626Position } from '@oasisdex/dma-library'
import type { OmniCustomStateParams } from 'features/omni-kit/controllers'
import { Erc4626CustomStateContextProvider } from 'features/omni-kit/protocols/erc-4626/contexts'
import { useErc4626TxHandler } from 'features/omni-kit/protocols/erc-4626/hooks'
import { useErc4626Metadata } from 'features/omni-kit/protocols/erc-4626/metadata'
import { erc4626EstimatedMarketCaps } from 'features/omni-kit/protocols/erc-4626/settings'
import { OmniEarnFormAction, OmniSidebarEarnPanel } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

// TODO: replace types with same as in oasis-borrow/pages/[networkOrProduct]/erc-4626/[...position].tsx:34
type Erc4626CustomStateProviderProps = OmniCustomStateParams<unknown, unknown[], Erc4626Position>

export const Erc4626CustomStateProvider: FC<Erc4626CustomStateProviderProps> = ({
  children,
  isOpening,
}) => {
  const formDefaults = {
    borrow: {},
    earn: {
      action: isOpening ? OmniEarnFormAction.OpenEarn : OmniEarnFormAction.DepositEarn,
      uiDropdown: OmniSidebarEarnPanel.Liquidity,
    },
    multiply: {},
  }

  return (
    <Erc4626CustomStateContextProvider estimatedMarketCap={erc4626EstimatedMarketCaps[0]}>
      {children({
        formDefaults,
        useDynamicMetadata: useErc4626Metadata,
        useTxHandler: useErc4626TxHandler,
      })}
    </Erc4626CustomStateContextProvider>
  )
}
