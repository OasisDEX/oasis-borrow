import { useInterpret } from '@xstate/react'
import React from 'react'

import { useFeatureToggle } from '../../../../helpers/useFeatureToggle'
import { IStrategyConfig, ProxyType } from '../../common/StrategyConfigTypes'
import { getEmptyPosition } from '../../oasisActionsLibWrapper'
import { OpenAaveStateMachine } from '../state'

function setupOpenAaveStateContext({
  machine,
  config,
}: {
  machine: OpenAaveStateMachine
  config: IStrategyConfig
}) {
  const useDpmProxy = useFeatureToggle('AaveUseDpmProxy')
  const effectiveStrategy = {
    ...config,
    proxyType: useDpmProxy ? ProxyType.DpmProxy : ProxyType.DsProxy,
  }
  const stateMachine = useInterpret(
    machine.withContext({
      strategyConfig: effectiveStrategy,
      userInput: {},
      tokens: config.tokens,
      currentStep: 1,
      totalSteps: 4,
      currentPosition: getEmptyPosition(config.tokens.collateral, config.tokens.debt),
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
