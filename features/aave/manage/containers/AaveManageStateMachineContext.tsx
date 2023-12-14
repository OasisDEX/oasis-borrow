import { useInterpret } from '@xstate/react'
import type { ManageAaveStateMachine } from 'features/aave/manage/state'
import type { IStrategyConfig, ManagePositionForm, PositionId } from 'features/aave/types'
import { ProxyType } from 'features/aave/types'
import type { VaultType } from 'features/generalManageVault/vaultType.types'
import { env } from 'process'
import React from 'react'

export const defaultManageTokenInputValues: ManagePositionForm = {
  // defaults for the manage collateral/debt are set here
  manageAction: undefined,
  manageInput1Value: undefined, // just to provide any value when debugging
  manageInput2Value: undefined, // just to provide any value when debugging
  closingToken: undefined,
}

function setupManageAaveStateContext({
  machine,
  strategy,
  positionId,
  updateStrategyConfig,
}: {
  machine: ManageAaveStateMachine
  strategy: IStrategyConfig
  positionId: PositionId
  updateStrategyConfig?: (vaultType: VaultType) => void
}) {
  const positionCreatedBy =
    positionId.vaultId !== undefined ? ProxyType.DpmProxy : ProxyType.DsProxy

  const stateMachine = useInterpret(
    machine.withContext({
      tokens: strategy.tokens,
      currentStep: 1,
      totalSteps: 3,
      strategyConfig: strategy,
      userInput: {},
      manageTokenInput: defaultManageTokenInputValues,
      positionCreatedBy: positionCreatedBy,
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
  positionId,
  updateStrategyConfig,
}: React.PropsWithChildren<{
  machine: ManageAaveStateMachine
  strategy: IStrategyConfig
  positionId: PositionId
  updateStrategyConfig?: (vaultType: VaultType) => void
}>) {
  const context = setupManageAaveStateContext({
    machine,
    strategy,
    positionId,
    updateStrategyConfig,
  })
  return (
    <manageAaveStateContext.Provider value={context}>{children}</manageAaveStateContext.Provider>
  )
}
