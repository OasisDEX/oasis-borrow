import { useInterpret } from '@xstate/react'
import { env } from 'process'
import React from 'react'

import { ManageAaveStateMachine } from '../state'

function setupManageAaveStateContext({ machine }: { machine: ManageAaveStateMachine }) {
  const stateMachine = useInterpret(machine, { devTools: env.NODE_ENV === 'development' }).start()
  return {
    stateMachine,
  }
}
export type ManageAaveStateMachineContext = ReturnType<typeof setupManageAaveStateContext>

const manageAaveStateContext = React.createContext<ManageAaveStateMachineContext | undefined>(
  undefined,
)

export function useManageAaveStateMachineContext(): ManageAaveStateMachineContext {
  const ac = React.useContext(manageAaveStateContext)
  if (!ac) {
    throw new Error('ManageAaveStateMachineContext not available!')
  }
  return ac
}

export function ManageAaveStateMachineContextProvider({
  children,
  machine,
}: React.PropsWithChildren<{ machine: ManageAaveStateMachine }>) {
  const context = setupManageAaveStateContext({ machine })
  return (
    <manageAaveStateContext.Provider value={context}>{children}</manageAaveStateContext.Provider>
  )
}
