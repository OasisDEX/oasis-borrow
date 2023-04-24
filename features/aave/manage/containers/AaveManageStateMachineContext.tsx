import { useInterpret } from '@xstate/react'
import { IStrategyConfig, ProxyType } from 'features/aave/common/StrategyConfigTypes'
import { ManageAaveStateMachine } from 'features/aave/manage/state'
import { PositionId } from 'features/aave/types'
import { env } from 'process'
import React from 'react'

export const defaultManageTokenInputValues = {
  // defaults for the manage collateral/debt are set here
  manageTokenAction: undefined,
  manageTokenActionValue: undefined, // just to provide any value when debugging
  closingToken: undefined,
}

function setupManageAaveStateContext({
  machine,
  strategy,
  positionId,
}: {
  machine: ManageAaveStateMachine
  strategy: IStrategyConfig
  positionId: PositionId
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
}: React.PropsWithChildren<{
  machine: ManageAaveStateMachine
  strategy: IStrategyConfig
  positionId: PositionId
}>) {
  const context = setupManageAaveStateContext({ machine, strategy, positionId })
  return (
    <manageAaveStateContext.Provider value={context}>{children}</manageAaveStateContext.Provider>
  )
}
