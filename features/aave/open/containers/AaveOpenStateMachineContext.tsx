import { AaveLikePosition } from '@oasisdex/dma-library'
import { useInterpret } from '@xstate/react'
import type { OpenAaveStateMachine } from 'features/aave/open/state'
import type { IStrategyConfig } from 'features/aave/types'
import { ProxyType } from 'features/aave/types'
import { zero } from 'helpers/zero'
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
      currentPosition: AaveLikePosition.emptyPosition(
        { amount: zero, symbol: effectiveStrategy.tokens.debt },
        { amount: zero, symbol: effectiveStrategy.tokens.collateral },
      ),
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
