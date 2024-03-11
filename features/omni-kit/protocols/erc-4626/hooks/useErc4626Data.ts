import { useProductContext } from 'components/context/ProductContextProvider'
import { omniPositionTriggersDataDefault } from 'features/omni-kit/constants'
import type { OmniProtocolHookProps } from 'features/omni-kit/types'
import { useObservable } from 'helpers/observableHook'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

export function useErc4626Data({
  dpmPositionData,
  networkId,
  tokenPriceUSDData,
}: OmniProtocolHookProps) {
  const { erc4626Position$ } = useProductContext()

  const [erc4626PositionData, erc4626PositionError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && tokenPriceUSDData
          ? erc4626Position$(
              tokenPriceUSDData[dpmPositionData.quoteToken],
              '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
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
