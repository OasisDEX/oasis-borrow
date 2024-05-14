import { useProductContext } from 'components/context/ProductContextProvider'
import { omniPositionTriggersDataDefault } from 'features/omni-kit/constants'
import type { DpmPositionData } from 'features/omni-kit/observables'
import type { OmniProtocolSettings, OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { getTriggersRequest } from 'helpers/lambda/triggers'
import { useObservable } from 'helpers/observableHook'
import type { LendingProtocol } from 'lendingProtocols'
import { makeObservable } from 'lendingProtocols/pipelines'
import { useMemo } from 'react'
import { EMPTY, of } from 'rxjs'

interface OmniTriggersDataProps {
  dpmPositionData?: DpmPositionData
  isOpening: boolean
  networkId: OmniSupportedNetworkIds
  pairId: number
  protocol: LendingProtocol
  settings: OmniProtocolSettings
}

export function useOmniTriggersData({
  dpmPositionData,
  isOpening,
  networkId,
  pairId,
  protocol,
  settings,
}: OmniTriggersDataProps) {
  const { onEveryBlock$ } = useProductContext()

  const getTriggersRequest$ = makeObservable(onEveryBlock$, getTriggersRequest)

  const poolId =
    settings.markets?.[networkId]?.[
      `${dpmPositionData?.collateralToken}-${dpmPositionData?.quoteToken}`
    ]?.[pairId - 1]

  const [positionTriggersData, positionTriggersError] = useObservable(
    useMemo(
      () =>
        !isOpening && settings.availableAutomations[networkId]?.length
          ? dpmPositionData
            ? getTriggersRequest$({ dpmProxy: dpmPositionData.proxy, networkId, poolId, protocol })
            : EMPTY
          : of(omniPositionTriggersDataDefault),
      [dpmPositionData, isOpening, networkId, poolId, protocol, settings.availableAutomations],
    ),
  )

  return {
    data: {
      positionTriggersData,
    },
    errors: [positionTriggersError],
  }
}
