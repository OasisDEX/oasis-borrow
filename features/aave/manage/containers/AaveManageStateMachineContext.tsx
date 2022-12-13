import { useInterpret } from '@xstate/react'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave/strategyConfig'
import { env } from 'process'
import React from 'react'

import { IStrategyConfig, ProxyType } from '../../common/StrategyConfigTypes'
import { PositionId } from '../../types'
import { ManageAaveStateMachine } from '../state'

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
      manageTokenInput: {
        // defaults for the manage collateral/debt are set here
        manageCollateralAction: ManageCollateralActionsEnum.DEPOSIT_COLLATERAL,
        manageDebtAction: ManageDebtActionsEnum.BORROW_DEBT,
        manageTokenActionValue: undefined, // just to provide any value when debugging
      },
      positionCreatedBy: positionCreatedBy,
      positionId: positionId,
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
