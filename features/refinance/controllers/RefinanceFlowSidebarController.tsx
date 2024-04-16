import { FlowSidebar } from 'components/FlowSidebar'
import { getOmniFilterConsumedProxy } from 'features/omni-kit/helpers'
import { useRefinanceContext } from 'features/refinance/contexts'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { useFlowState } from 'helpers/useFlowState'
import { zero } from 'helpers/zero'
import React from 'react'

export const RefinanceFlowSidebarController = () => {
  const {
    metadata: { flowStateFilter },
    environment: { chainInfo, protocol },
    form: { updateState },
    poolData: { pairId },
    steps: { setStep, setNextStep },
  } = useRefinanceContext()

  const flowState = useFlowState({
    pairId,
    protocol,
    networkId: chainInfo.chainId,
    amount: zero,
    token: 'ETH',
    filterConsumedProxy: async (events) => getOmniFilterConsumedProxy(events, flowStateFilter),
    onProxiesAvailable: async (events) => {
      const filteredEventsBooleanMap = await Promise.all(
        events.map((event) => flowStateFilter({ event })),
      )
      const filteredEvents = events.filter(
        (_event, eventIndex) => filteredEventsBooleanMap[eventIndex],
      )
      updateState('hasSimilarPosition', !!filteredEvents.length)
    },
    onEverythingReady: (data) => {
      updateState('dpm', data.availableProxies[0])
      setNextStep()
    },
    onGoBack: () => setStep(RefinanceSidebarStep.Strategy),
  })

  return <FlowSidebar {...flowState} />
}
