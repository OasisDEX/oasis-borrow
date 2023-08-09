import { useActor } from '@xstate/react'
import { useSimulationYields } from 'features/aave/hooks'
import { useManageAaveStateMachineContext } from 'features/aave/manage/containers/AaveManageStateMachineContext'
import { IStrategyConfig } from 'features/aave/types'
import { AppSpinner } from 'helpers/AppSpinner'
import { ReserveConfigurationData, ReserveData } from 'lendingProtocols/aaveCommon'
import React from 'react'

import { PositionInfoComponent } from './PositionInfoComponent'

export type ManageSectionComponentProps = {
  aaveReserveState: ReserveConfigurationData
  aaveReserveDataDebtToken: ReserveData
  strategyConfig: IStrategyConfig
}

export function ManageSectionComponent({
  aaveReserveState,
  aaveReserveDataDebtToken,
  strategyConfig,
}: ManageSectionComponentProps) {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)
  const { position } = state.context.protocolData || {}

  const simulations = useSimulationYields({
    amount: position?.collateral.amount,
    riskRatio: position?.riskRatio,
    fields: ['7Days'],
    strategy: strategyConfig,
    token: state.context.tokens.deposit,
  })

  if (!position || !aaveReserveState?.liquidationThreshold) {
    return <AppSpinner />
  }

  return (
    <PositionInfoComponent
      aaveReserveDataDebtToken={aaveReserveDataDebtToken}
      apy={simulations?.apy}
      position={position}
    />
  )
}
