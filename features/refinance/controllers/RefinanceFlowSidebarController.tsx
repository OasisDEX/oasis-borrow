import { FlowSidebar } from 'components/FlowSidebar'
import { getOmniFilterConsumedProxy } from 'features/omni-kit/helpers'
import { useRefinanceContext } from 'features/refinance/contexts'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { useFlowState } from 'helpers/useFlowState'
import { zero } from 'helpers/zero'
import React from 'react'
import { Box } from 'theme-ui'

export const RefinanceFlowSidebarController = () => {
  const {
    metadata: { flowStateFilter },
    environment: { chainInfo },
    form: { updateState },
    poolData: { pairId },
    position: { lendingProtocol: protocol, owner },
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
      // Check if owner is already dpm and use it as dpm for refinance, if not fallback to first available dpm
      const dpm =
        data.availableProxies.find((item) => item.address.toLowerCase() === owner) ||
        data.availableProxies[0]

      updateState('dpm', dpm)

      // If position owner is dpm that will be used for refinance
      // skip to refinance tx
      if (dpm.address.toLowerCase() === owner) {
        setStep(RefinanceSidebarStep.Changes)
      } else {
        setNextStep()
      }
    },
    onGoBack: () => setStep(RefinanceSidebarStep.Strategy),
    step: '3/5',
    useHeaderBackBtn: true,
  })

  return (
    <Box sx={{ width: '100%' }}>
      <FlowSidebar {...flowState} />
    </Box>
  )
}
