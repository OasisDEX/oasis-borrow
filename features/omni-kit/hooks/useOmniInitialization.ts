import type { ItemProps } from 'components/infoSection/Item'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  getAutomationAutoBSFormDefaults,
  useOmniAutomationAutoBSFormReducto,
} from 'features/omni-kit/state/automation/auto-bs'
import {
  getAutomationPartialTakeProfitFormDefaults,
  useOmniAutomationPartialTakeProfitFormReducto,
} from 'features/omni-kit/state/automation/partial-take-profit'
import {
  getAutomationStopLossFormDefaults,
  useOmniStopLossAutomationFormReducto,
} from 'features/omni-kit/state/automation/stop-loss'
import {
  getAutomationTrailingStopLossFormDefaults,
  useOmniAutomationTrailingStopLossFormReducto,
} from 'features/omni-kit/state/automation/trailing-stop-loss'
import type {
  OmniAutomationSimulationResponse,
  OmniPositionSet,
  OmniSimulationData,
  OmniSimulationSwap,
} from 'features/omni-kit/types'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import type { LendingProtocol } from 'lendingProtocols'
import { useState } from 'react'

export function useOmniInitialization<OmniPositionType>({
  poolId,
  positionTriggers,
  protocol,
}: {
  poolId?: string
  positionTriggers: GetTriggersResponse
  protocol: LendingProtocol
}) {
  const stopLossForm = useOmniStopLossAutomationFormReducto(
    getAutomationStopLossFormDefaults({ poolId, positionTriggers, protocol }),
  )
  const trailingStopLossForm = useOmniAutomationTrailingStopLossFormReducto(
    getAutomationTrailingStopLossFormDefaults({ poolId, positionTriggers, protocol }),
  )
  const autoSellForm = useOmniAutomationAutoBSFormReducto(
    getAutomationAutoBSFormDefaults({
      poolId,
      positionTriggers,
      type: AutomationFeatures.AUTO_SELL,
      protocol,
    }),
  )
  const autoBuyForm = useOmniAutomationAutoBSFormReducto(
    getAutomationAutoBSFormDefaults({
      poolId,
      positionTriggers,
      type: AutomationFeatures.AUTO_BUY,
      protocol,
    }),
  )
  const partialTakeProfitForm = useOmniAutomationPartialTakeProfitFormReducto(
    getAutomationPartialTakeProfitFormDefaults({ poolId, positionTriggers, protocol }),
  )

  const [cachedPosition, setCachedPosition] = useState<OmniPositionSet<OmniPositionType>>()
  const [cachedSwap, setCachedSwap] = useState<OmniSimulationSwap>()
  const [simulation, setSimulation] = useState<OmniSimulationData<OmniPositionType>>()
  const [isSimulationLoading, setIsLoadingSimulation] = useState(false)

  const [automationSimulationData, setAutomationSimulationData] =
    useState<OmniAutomationSimulationResponse>()
  const [isAutomationSimulationLoading, setAutomationIsLoadingSimulation] = useState(false)
  const [cachedAutomationOrderInfoItems, setCachedAutomationOrderInfoItems] =
    useState<ItemProps[]>()

  return {
    automationForms: {
      stopLoss: stopLossForm,
      trailingStopLoss: trailingStopLossForm,
      autoSell: autoSellForm,
      autoBuy: autoBuyForm,
      partialTakeProfit: partialTakeProfitForm,
      constantMultiple: partialTakeProfitForm,
      autoTakeProfit: partialTakeProfitForm,
    },
    automationSimulationData,
    cachedAutomationOrderInfoItems,
    cachedPosition,
    cachedSwap,
    isAutomationSimulationLoading,
    isSimulationLoading,
    setAutomationIsLoadingSimulation,
    setAutomationSimulationData,
    setCachedAutomationOrderInfoItems,
    setCachedPosition,
    setCachedSwap,
    setIsLoadingSimulation,
    setSimulation,
    simulation,
  }
}
