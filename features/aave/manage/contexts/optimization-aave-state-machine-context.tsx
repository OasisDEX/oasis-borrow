import { useInterpret, useSelector } from '@xstate/react'
import type { ProxiesRelatedWithPosition } from 'features/aave/helpers'
import {
  autoBuyTriggerAaveStateMachine,
  optimizationAaveStateMachine,
} from 'features/aave/manage/state'
import type { IStrategyConfig } from 'features/aave/types'
import { env } from 'process'
import React, { useEffect } from 'react'

import { useManageAaveStateMachineContext } from './aave-manage-state-machine-context'

function useSetupOptimizationStateContext(
  strategy: IStrategyConfig,
  proxies?: ProxiesRelatedWithPosition,
) {
  const autobuyStateMachine = useInterpret(autoBuyTriggerAaveStateMachine, {
    devTools: env.NODE_ENV !== 'production',
  }).start()

  return useInterpret(
    optimizationAaveStateMachine.withContext({
      strategyConfig: strategy,
      dpm: proxies?.dpmProxy,
      showAutoBuyBanner: true,
      autoBuyTrigger: autobuyStateMachine,
      currentTriggers: {
        triggers: {},
      },
    }),
    { devTools: env.NODE_ENV !== 'production' },
  ).start()
}

export type OptimizationAaveStateMachineContext = ReturnType<
  typeof useSetupOptimizationStateContext
>
const optimizationAaveStateContext = React.createContext<
  OptimizationAaveStateMachineContext | undefined
>(undefined)

export function useOptimizationAaveStateMachineContext(): OptimizationAaveStateMachineContext {
  const ac = React.useContext(optimizationAaveStateContext)
  if (!ac) {
    throw new Error('OptimizationAaveStateMachineContext not available!')
  }
  return ac
}

function OptimizationStateUpdater({ children }: React.PropsWithChildren<{}>) {
  const { stateMachine } = useManageAaveStateMachineContext()
  const position = useSelector(stateMachine, (state) => state.context.currentPosition)
  const context = useOptimizationAaveStateMachineContext()

  useEffect(() => {
    if (position) {
      context.send({ type: 'POSITION_UPDATED', position })
    }
  }, [context, position])
  return <>{children}</>
}

export function OptimizationAaveStateMachineContextProvider({
  strategy,
  proxies,
  children,
}: React.PropsWithChildren<{ strategy: IStrategyConfig; proxies: ProxiesRelatedWithPosition }>) {
  const context = useSetupOptimizationStateContext(strategy, proxies)

  return (
    <optimizationAaveStateContext.Provider value={context}>
      <OptimizationStateUpdater>{children}</OptimizationStateUpdater>
    </optimizationAaveStateContext.Provider>
  )
}
