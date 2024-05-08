import { useProductContext } from 'components/context/ProductContextProvider'
import { mapErc4626Events } from 'features/omni-kit/protocols/erc-4626/history/mapErc4626Events'
import type { Erc4626HistoryEvent } from 'features/omni-kit/protocols/erc-4626/history/types'
import { getErc4626PositionAggregatedData$ } from 'features/omni-kit/protocols/erc-4626/observables/getErc4626AggregatedData'
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
  const { address, token } = erc4626VaultsByName[label as string]

  const [erc4626PositionData, erc4626PositionError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && tokenPriceUSDData
          ? erc4626Position$(
              tokenPriceUSDData[dpmPositionData.quoteToken],
              address,
              token,
              dpmPositionData,
              networkId,
            )
          : EMPTY,
      [dpmPositionData, tokenPriceUSDData],
    ),
  )

  const [erc4626PositionAggregatedData, erc2626PositionAggregatedError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && erc4626PositionData
          ? getErc4626PositionAggregatedData$({
              dpmPositionData,
              networkId,
              vault: address,
            })
          : EMPTY,
      [dpmPositionData, erc4626PositionData, networkId],
    ),
  )

  return {
    data: {
      aggregatedData: {
        auction: {},
        history: mapErc4626Events(
          erc4626PositionAggregatedData?.history ?? [],
        ) as Erc4626HistoryEvent[],
      },
      poolId: erc4626PositionData?.vault.address,
      positionData: erc4626PositionData,
      protocolPricesData: tokenPriceUSDData,
    },
    errors: [erc4626PositionError, erc2626PositionAggregatedError],
  }
}
