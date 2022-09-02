import { useInterpret } from '@xstate/react'
import React from 'react'

import { OpenAaveStateMachine } from '../state'

function setupOpenAaveStateContext({ machine }: { machine: OpenAaveStateMachine }) {
  const stateMachine = useInterpret(machine).start()
  return {
    stateMachine,
  }
}
export type OpenAaveStateMachineContext = ReturnType<typeof setupOpenAaveStateContext>

const openAaveStateContext = React.createContext<OpenAaveStateMachineContext | undefined>(undefined)

export function useOpenAaveStateMachineContext(): OpenAaveStateMachineContext {
  const ac = React.useContext(openAaveStateContext)
  if (!ac) {
    throw new Error('OpenAaveStateMachineContext not available!')
  }
  return ac
}

export function OpenAaveStateMachineContextProvider({
  children,
  machine,
}: React.PropsWithChildren<{ machine: OpenAaveStateMachine }>) {
  const context = setupOpenAaveStateContext({ machine })
  return <openAaveStateContext.Provider value={context}>{children}</openAaveStateContext.Provider>
}
