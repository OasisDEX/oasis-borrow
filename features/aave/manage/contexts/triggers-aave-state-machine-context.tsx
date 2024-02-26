import { useInterpret, useSelector } from '@xstate/react'
import { getToken } from 'blockchain/tokensMetadata'
import type { AddressesRelatedWithPosition } from 'features/aave/helpers'
import {
  autoBuyTriggerAaveStateMachine,
  autoSellTriggerAaveStateMachine,
  triggersAaveStateMachine,
} from 'features/aave/manage/state'
import type { IStrategyConfig } from 'features/aave/types'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange.constants'
import type { AutomationChangeFeature } from 'features/automation/common/state/automationFeatureChange.types'
import { AutomationFeatures } from 'features/automation/common/types'
import { uiChanges } from 'helpers/uiChanges'
import { useUIChanges } from 'helpers/uiChangesHook'
import { env } from 'process'
import React, { useEffect } from 'react'

import { useManageAaveStateMachineContext } from './aave-manage-state-machine-context'

export const shouldUsePriceInput = (strategy: IStrategyConfig): boolean => {
  return getToken(strategy.tokens.debt).tags.some((tag) => tag === 'stablecoin')
}

function useSetupTriggersStateContext(
  strategy: IStrategyConfig,
  proxies?: AddressesRelatedWithPosition,
) {
  const autoBuyContext = autoBuyTriggerAaveStateMachine.context
  const autobuyStateMachine = useInterpret(
    autoBuyTriggerAaveStateMachine.withContext({
      ...autoBuyContext,
      networkId: strategy.networkId,
      usePriceInput: shouldUsePriceInput(strategy),
    }),
    {
      devTools: env.NODE_ENV !== 'production',
    },
  ).start()

  const autoSellContext = autoSellTriggerAaveStateMachine.context
  const autosellStateMachine = useInterpret(
    autoSellTriggerAaveStateMachine.withContext({
      ...autoSellContext,
      networkId: strategy.networkId,
      usePriceInput: shouldUsePriceInput(strategy),
    }),
    {
      devTools: env.NODE_ENV !== 'production',
    },
  ).start()

  return useInterpret(
    triggersAaveStateMachine.withContext({
      strategyConfig: strategy,
      dpm: proxies?.dpmProxy,
      showAutoBuyBanner: strategy.isAutomationFeatureEnabled(AutomationFeatures.AUTO_BUY),
      autoBuyTrigger: autobuyStateMachine,
      autoSellTrigger: autosellStateMachine,
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
  const signer = useSelector(stateMachine, (state) =>
    state.context.web3Context && 'transactionProvider' in state.context.web3Context
      ? state.context.web3Context.transactionProvider
      : null,
  )
  const triggerStateMachine = useTriggersAaveStateMachineContext()
  const protectionCurrentView = useSelector(
    triggerStateMachine,
    (state) => state.context.protectionCurrentView,
  )
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  useEffect(() => {
    if (position) {
      triggerStateMachine.send({ type: 'POSITION_UPDATED', position })
    }
  }, [position])

  useEffect(() => {
    if (signer) {
      triggerStateMachine.send({ type: 'SIGNER_UPDATED', signer })
    }
  }, [signer])

  useEffect(() => {
    if (protectionCurrentView === 'stop-loss') {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Protection',
        currentProtectionFeature: AutomationFeatures.STOP_LOSS,
      })
    }
    if (protectionCurrentView === 'auto-sell') {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Protection',
        currentProtectionFeature: AutomationFeatures.AUTO_SELL,
      })
    }
  }, [protectionCurrentView])

  useEffect(() => {
    if (activeAutomationFeature?.currentProtectionFeature === AutomationFeatures.AUTO_SELL) {
      triggerStateMachine.send({ type: 'CHANGE_VIEW', view: 'auto-sell' })
    }
  }, [activeAutomationFeature?.currentProtectionFeature])
  return <>{children}</>
}

export function TriggersAaveStateMachineContextProvider({
  strategy,
  proxies,
  children,
}: React.PropsWithChildren<{ strategy: IStrategyConfig; proxies: AddressesRelatedWithPosition }>) {
  const context = useSetupTriggersStateContext(strategy, proxies)

  return (
    <triggersAaveStateContext.Provider value={context}>
      <TriggersStateUpdater>{children}</TriggersStateUpdater>
    </triggersAaveStateContext.Provider>
  )
}
