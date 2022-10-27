import { useActor, useInterpret } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { StopLossStateMachine } from 'features/automation/protection/stopLoss/state/stopLossStateMachine'
import { WithChildren } from 'helpers/types'
import { env } from 'process'
import React, { createContext, useContext, useEffect } from 'react'

export const stopLossContext = createContext<StopLossStateMachineContext | undefined>(undefined)

function setupStopLossStateContext({ machine }: { machine: StopLossStateMachine }) {
  const stateMachine = useInterpret(machine, { devTools: env.NODE_ENV !== 'production' }).start()
  return {
    stateMachine,
  }
}

export type StopLossStateMachineContext = ReturnType<typeof setupStopLossStateContext>

export function useStopLossContext(): StopLossStateMachineContext {
  const context = useContext(stopLossContext)
  if (!context) {
    throw new Error('useStopLossContext must be used within a StopLossContextProvider')
  }
  return context
}

export function StopLossContextProvider({
  children,
  machine,
  commonData,
}: WithChildren & { machine: StopLossStateMachine; commonData: { debt: BigNumber } }) {
  const stateMachine = useInterpret(machine, { devTools: env.NODE_ENV !== 'production' }).start()
  const automationContext = useAutomationContext()
  const [, send] = useActor(stateMachine)

  // PUSH DEPENDENCIES TO MACHINE
  // MOST LIKELY SHOULD BE CONVERTED TO ACTORS AND SPAWN IN STOP LOSS MACHINE WITH THEIR CONTEXT
  useEffect(() => {
    send({ type: 'loadAutomationData', data: automationContext })
    send({ type: 'loadCommonData', data: { debt: commonData.debt } })
  }, [automationContext, commonData.debt.toString()])

  // GIVEN EXAMPLE DOES NOT INCLUDE HANDLING FOR DEFAULT FORM STATE WHEN TRIGGER IS NOT CREATED YET
  return <stopLossContext.Provider value={{ stateMachine }}>{children}</stopLossContext.Provider>
}
