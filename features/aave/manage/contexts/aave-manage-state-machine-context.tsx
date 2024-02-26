import { useInterpret } from '@xstate/react'
import type { AddressesRelatedWithPosition } from 'features/aave/helpers'
import type { ManageAaveStateMachine } from 'features/aave/manage/state'
import type { IStrategyConfig, ManageTokenInput, PositionId } from 'features/aave/types'
import { ProxyType } from 'features/aave/types'
import type { VaultType } from 'features/generalManageVault/vaultType.types'
import { env } from 'process'
import React from 'react'

import { TriggersAaveStateMachineContextProvider } from './triggers-aave-state-machine-context'

export const defaultManageTokenInputValues: ManageTokenInput = {
  // defaults for the manage collateral/debt are set here
  manageAction: undefined,
  manageInput1Value: undefined, // just to provide any value when debugging
  manageInput2Value: undefined, // just to provide any value when debugging
  closingToken: undefined,
}

function useSetupManageAaveStateContext({
  machine,
  strategy,
  positionId,
  proxyType,
  updateStrategyConfig,
}: {
  machine: ManageAaveStateMachine
  strategy: IStrategyConfig
  positionId: PositionId
  proxyType: ProxyType
  updateStrategyConfig?: (vaultType: VaultType) => void
}) {
  const stateMachine = useInterpret(
    machine.withContext({
      tokens: strategy.tokens,
      currentStep: 1,
      totalSteps: 3,
      strategyConfig: strategy,
      userInput: {},
      manageTokenInput: defaultManageTokenInputValues,
      positionCreatedBy: proxyType,
      positionId: positionId,
      getSlippageFrom: strategy.defaultSlippage !== undefined ? 'strategyConfig' : 'userSettings',
      updateStrategyConfig,
      historyEvents: [],
    }),
    { devTools: env.NODE_ENV !== 'production' },
  ).start()
  return {
    stateMachine,
  }
}

export type ManageAaveStateMachineContext = ReturnType<typeof useSetupManageAaveStateContext>

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
  positionId,
  proxies,
  updateStrategyConfig,
}: React.PropsWithChildren<{
  machine: ManageAaveStateMachine
  strategy: IStrategyConfig
  positionId: PositionId
  proxies: AddressesRelatedWithPosition
  updateStrategyConfig?: (vaultType: VaultType) => void
}>) {
  const proxyType = positionId.vaultId !== undefined ? ProxyType.DpmProxy : ProxyType.DsProxy

  const context = useSetupManageAaveStateContext({
    machine,
    strategy,
    positionId,
    proxyType,
    updateStrategyConfig,
  })

  return (
    <manageAaveStateContext.Provider value={context}>
      <TriggersAaveStateMachineContextProvider proxies={proxies} strategy={strategy}>
        <>{children}</>
      </TriggersAaveStateMachineContextProvider>
    </manageAaveStateContext.Provider>
  )
}
