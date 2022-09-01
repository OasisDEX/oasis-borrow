import { useInterpret } from '@xstate/react'
import { createContext, PropsWithChildren, useContext } from 'react'

import { OpenAaveStateMachine } from '../state/machine'

function setupOpenAaveStateContext({ machine }: { machine: OpenAaveStateMachine }) {
  const stateMachine = useInterpret(machine).start()
  return {
    stateMachine,
  }
}
export type OpenAaveStateMachineContext = ReturnType<typeof setupOpenAaveStateContext>

const openAaveStateContext = createContext<OpenAaveStateMachineContext | undefined>(undefined)

export function useOpenAaveStateMachineContext(): OpenAaveStateMachineContext {
  const ac = useContext(openAaveStateContext)
  if (!ac) {
    throw new Error(
      "OpenAaveStateMachineContext not available! useOpenAaveStateMachineContext can't be used serverside",
    )
  }
  return ac
}

export function OpenAaveStateMachineContextProvider({
  children,
  machine,
}: PropsWithChildren<{ machine: OpenAaveStateMachine }>) {
  const context = setupOpenAaveStateContext({ machine })
  return <openAaveStateContext.Provider value={context}>{children}</openAaveStateContext.Provider>
}
