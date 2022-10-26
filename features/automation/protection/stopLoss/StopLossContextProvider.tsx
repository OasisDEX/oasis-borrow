import { useInterpret } from '@xstate/react'
import { StopLossStateMachine } from 'features/automation/protection/stopLoss/state/stopLossStateMachine'
import { WithChildren } from 'helpers/types'
import { env } from 'process'
import React, { createContext, useContext } from 'react'

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
}: WithChildren & { machine: StopLossStateMachine }) {
  const stateMachine = useInterpret(machine, { devTools: env.NODE_ENV !== 'production' }).start()

  return <stopLossContext.Provider value={{ stateMachine }}>{children}</stopLossContext.Provider>
}
