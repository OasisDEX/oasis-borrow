import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { isAppContextAvailable, useAppContext } from 'components/AppContextProvider'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import {
  AutoBSTriggerData,
  defaultAutoBSData,
  extractAutoBSData,
} from 'features/automation/common/state/autoBSTriggerData'
import {
  ConstantMultipleTriggerData,
  defaultConstantMultipleData,
  extractConstantMultipleData,
} from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import {
  defaultStopLossData,
  extractStopLossData,
  StopLossTriggerData,
} from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import React, { useContext, useEffect, useState } from 'react'

interface AutomationContext {
  autoSellTriggerData: AutoBSTriggerData
  autoBuyTriggerData: AutoBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  automationTriggersData: TriggersData
}

export const automationContext = React.createContext<AutomationContext | undefined>(undefined)

export function useAutomationContext(): AutomationContext {
  const ac = useContext(automationContext)
  if (!ac) {
    throw new Error(
      "AutomationContext not available! useAutomationContext can't be used serverside",
    )
  }
  return ac
}

/*
  This component is providing computed data from cache about active automation triggers on the vault
*/

const automationContextInitialState = {
  autoBuyTriggerData: defaultAutoBSData,
  autoSellTriggerData: defaultAutoBSData,
  stopLossTriggerData: defaultStopLossData,
  constantMultipleTriggerData: defaultConstantMultipleData,
  automationTriggersData: { isAutomationEnabled: false, triggers: [] },
}

export function AutomationContextProvider({ children, id }: { id: BigNumber } & WithChildren) {
  const [context, setContext] = useState<AutomationContext>(automationContextInitialState)

  if (!isAppContextAvailable()) {
    return null
  }

  const { automationTriggersData$ } = useAppContext()
  const autoTriggersData$ = automationTriggersData$(id)
  const [automationTriggersData] = useObservable(autoTriggersData$)

  useEffect(() => {
    if (automationTriggersData) {
      setContext({
        autoBuyTriggerData: extractAutoBSData({
          triggersData: automationTriggersData,
          triggerType: TriggerType.BasicBuy,
        }),
        autoSellTriggerData: extractAutoBSData({
          triggersData: automationTriggersData,
          triggerType: TriggerType.BasicSell,
        }),
        stopLossTriggerData: extractStopLossData(automationTriggersData),
        constantMultipleTriggerData: extractConstantMultipleData(automationTriggersData),
        automationTriggersData,
      })
    }
  }, [automationTriggersData])

  return <automationContext.Provider value={context}>{children}</automationContext.Provider>
}
