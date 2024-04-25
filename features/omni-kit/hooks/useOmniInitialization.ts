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
import { useState } from 'react'

export function useOmniInitialization<OmniPositionType>({
  positionTriggers,
}: {
  positionTriggers: GetTriggersResponse
}) {
  const stopLossForm = useOmniStopLossAutomationFormReducto(
    getAutomationStopLossFormDefaults(positionTriggers),
  )
  const trailingStopLossForm = useOmniAutomationTrailingStopLossFormReducto(
    getAutomationTrailingStopLossFormDefaults(positionTriggers),
  )
  const autoSellForm = useOmniAutomationAutoBSFormReducto(
    getAutomationAutoBSFormDefaults(positionTriggers, AutomationFeatures.AUTO_SELL),
  )
  const autoBuyForm = useOmniAutomationAutoBSFormReducto(
    getAutomationAutoBSFormDefaults(positionTriggers, AutomationFeatures.AUTO_BUY),
  )
  const partialTakeProfitForm = useOmniAutomationPartialTakeProfitFormReducto(
    getAutomationPartialTakeProfitFormDefaults(positionTriggers),
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
    cachedPosition,
    setCachedPosition,
    cachedSwap,
    setCachedSwap,
    simulation,
    setSimulation,
    isSimulationLoading,
    setIsLoadingSimulation,
    automationSimulationData,
    setAutomationSimulationData,
    isAutomationSimulationLoading,
    setAutomationIsLoadingSimulation,
    cachedAutomationOrderInfoItems,
    setCachedAutomationOrderInfoItems,
  }
}
