import React from 'react'
import { useActor } from '@xstate/react'
import { PositionInfoComponent } from 'features/aave/components/PositionInfoComponent'
import { useSimulationYields } from 'features/aave/hooks'
import { useManageAaveStateMachineContext } from 'features/aave/manage/containers/AaveManageStateMachineContext'
import { IStrategyConfig } from 'features/aave/types'
import { AppSpinner } from 'helpers/AppSpinner'
import {
  AaveLikeReserveConfigurationData,
  AaveLikeReserveData,
} from 'lendingProtocols/aave-like-common'

export type ManageSectionComponentProps = {
  aaveReserveState: AaveLikeReserveConfigurationData
  aaveReserveDataDebtToken: AaveLikeReserveData
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
