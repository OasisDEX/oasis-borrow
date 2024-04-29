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
  poolId?: string
  protocol: LendingProtocol
  settings: OmniProtocolSettings
}

export function useOmniTriggersData({
  dpmPositionData,
  isOpening,
  networkId,
  poolId,
  protocol,
  settings,
}: OmniTriggersDataProps) {
  const { onEveryBlock$ } = useProductContext()

  const getTriggersRequest$ = makeObservable(onEveryBlock$, getTriggersRequest)

  const [positionTriggersData, positionTriggersError] = useObservable(
    useMemo(
      () =>
        !isOpening && settings.availableAutomations[networkId]?.length
          ? dpmPositionData
            ? getTriggersRequest$({ dpm: dpmPositionData, networkId, poolId, protocol })
            : EMPTY
          : of(omniPositionTriggersDataDefault),
      [dpmPositionData, networkId, settings.availableAutomations],
    ),
  )

  return {
    data: {
      positionTriggersData,
    },
    errors: [positionTriggersError],
  }
}
