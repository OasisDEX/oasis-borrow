import { useInterpret } from '@xstate/react'
import { getEmptyPosition } from 'actions/aave'
import { IStrategyConfig, ProxyType } from 'features/aave/common'
import { OpenAaveStateMachine } from 'features/aave/open/state'
import React from 'react'

function setupOpenAaveStateContext({
  machine,
  config,
}: {
  machine: OpenAaveStateMachine
  config: IStrategyConfig
}) {
  const effectiveStrategy = {
    ...config,
    proxyType: ProxyType.DpmProxy,
  }
  const stateMachine = useInterpret(
    machine.withContext({
      strategyConfig: effectiveStrategy,
      userInput: {},
      tokens: config.tokens,
      currentStep: 1,
      totalSteps: 4,
      currentPosition: getEmptyPosition(config.tokens.collateral, config.tokens.debt),
      getSlippageFrom:
        effectiveStrategy.defaultSlippage !== undefined ? 'strategyConfig' : 'userSettings',
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
