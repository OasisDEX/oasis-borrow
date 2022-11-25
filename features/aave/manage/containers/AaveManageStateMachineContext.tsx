import { useInterpret } from '@xstate/react'
import { env } from 'process'
import React from 'react'

import { StrategyConfig } from '../../common/StrategyConfigTypes'
import { ManageAaveStateMachine } from '../state'

function setupManageAaveStateContext({
  machine,
  strategy,
  address,
}: {
  machine: ManageAaveStateMachine
  strategy: StrategyConfig
  address: string
}) {
  const stateMachine = useInterpret(
    machine.withContext({
      tokens: strategy.tokens,
      currentStep: 1,
      totalSteps: 3,
      strategyConfig: strategy,
      userInput: {},
      address,
    }),
    { devTools: env.NODE_ENV !== 'production' },
  ).start()
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
  strategy,
  address,
}: React.PropsWithChildren<{
  machine: ManageAaveStateMachine
  strategy: StrategyConfig
  address: string
}>) {
  const context = setupManageAaveStateContext({ machine, strategy, address })
  return (
    <manageAaveStateContext.Provider value={context}>{children}</manageAaveStateContext.Provider>
  )
}
