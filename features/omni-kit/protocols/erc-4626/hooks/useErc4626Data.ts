import { useProductContext } from 'components/context/ProductContextProvider'
import { omniPositionTriggersDataDefault } from 'features/omni-kit/constants'
import { erc4626VaultsByName } from 'features/omni-kit/protocols/erc-4626/settings'
import type { OmniProtocolHookProps } from 'features/omni-kit/types'
import { useObservable } from 'helpers/observableHook'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

export function useErc4626Data({
  dpmPositionData,
  label,
  networkId,
  tokenPriceUSDData,
}: OmniProtocolHookProps) {
  const { erc4626Position$ } = useProductContext()

  // it is safe to assume that in erc-4626 context label is always availabe string
  const { address } = erc4626VaultsByName[label as string]

  const [erc4626PositionData, erc4626PositionError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && tokenPriceUSDData
          ? erc4626Position$(
              tokenPriceUSDData[dpmPositionData.quoteToken],
              address,
              dpmPositionData,
              networkId,
            )
          : EMPTY,
      [dpmPositionData, tokenPriceUSDData],
    ),
  )

  return {
    data: {
      aggregatedData: {
        auction: {},
        history: [],
      },
      positionData: erc4626PositionData,
      protocolPricesData: tokenPriceUSDData,
      positionTriggersData: omniPositionTriggersDataDefault,
    },
    errors: [erc4626PositionError],
  }
}
