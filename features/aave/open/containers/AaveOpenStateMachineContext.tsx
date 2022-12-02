import { useInterpret } from '@xstate/react'
import React from 'react'

import { IStrategyConfig } from '../../common/StrategyConfigTypes'
import { EMPTY_POSITION } from '../../oasisActionsLibWrapper'
import { OpenAaveStateMachine } from '../state'

function setupOpenAaveStateContext({
  machine,
  config,
}: {
  machine: OpenAaveStateMachine
  config: IStrategyConfig
}) {
  const stateMachine = useInterpret(
    machine.withContext({
      strategyConfig: config,
      userInput: {},
      tokens: config.tokens,
      currentStep: 1,
      totalSteps: 4,
      currentPosition: EMPTY_POSITION,
    }),
    { devTools: process.env.NODE_ENV !== 'production' },
  ).start()
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
  config,
}: React.PropsWithChildren<{ machine: OpenAaveStateMachine; config: IStrategyConfig }>) {
  const context = setupOpenAaveStateContext({ machine, config })
  return <openAaveStateContext.Provider value={context}>{children}</openAaveStateContext.Provider>
}
