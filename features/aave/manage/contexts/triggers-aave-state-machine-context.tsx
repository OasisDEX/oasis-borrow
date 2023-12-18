import { useInterpret, useSelector } from '@xstate/react'
import type { ProxiesRelatedWithPosition } from 'features/aave/helpers'
import {
  autoBuyTriggerAaveStateMachine,
  triggersAaveStateMachine,
} from 'features/aave/manage/state'
import type { IStrategyConfig } from 'features/aave/types'
import { env } from 'process'
import React, { useEffect } from 'react'

import { useManageAaveStateMachineContext } from './aave-manage-state-machine-context'

function useSetupTriggersStateContext(
  strategy: IStrategyConfig,
  proxies?: ProxiesRelatedWithPosition,
) {
  const autobuyStateMachine = useInterpret(autoBuyTriggerAaveStateMachine, {
    devTools: env.NODE_ENV !== 'production',
  }).start()

  return useInterpret(
    triggersAaveStateMachine.withContext({
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

export type TriggersAaveStateMachineContext = ReturnType<typeof useSetupTriggersStateContext>
const triggersAaveStateContext = React.createContext<TriggersAaveStateMachineContext | undefined>(
  undefined,
)

export function useTriggersAaveStateMachineContext(): TriggersAaveStateMachineContext {
  const ac = React.useContext(triggersAaveStateContext)
  if (!ac) {
    throw new Error('TriggersAaveStateMachineContext not available!')
  }
  return ac
}

function TriggersStateUpdater({ children }: React.PropsWithChildren<{}>) {
  const { stateMachine } = useManageAaveStateMachineContext()
  const position = useSelector(stateMachine, (state) => state.context.currentPosition)
  const context = useTriggersAaveStateMachineContext()

  useEffect(() => {
    if (position) {
      context.send({ type: 'POSITION_UPDATED', position })
    }
  }, [context, position])
  return <>{children}</>
}

export function TriggersAaveStateMachineContextProvider({
  strategy,
  proxies,
  children,
}: React.PropsWithChildren<{ strategy: IStrategyConfig; proxies: ProxiesRelatedWithPosition }>) {
  const context = useSetupTriggersStateContext(strategy, proxies)

  return (
    <triggersAaveStateContext.Provider value={context}>
      <TriggersStateUpdater>{children}</TriggersStateUpdater>
    </triggersAaveStateContext.Provider>
  )
}
