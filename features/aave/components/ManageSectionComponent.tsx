import { useActor } from '@xstate/react'
import { useSimulationYields } from 'features/aave/hooks'
import { useManageAaveStateMachineContext } from 'features/aave/manage/containers/AaveManageStateMachineContext'
import type { IStrategyConfig } from 'features/aave/types'
import { AppSpinner } from 'helpers/AppSpinner'
import type {
  AaveLikeReserveConfigurationData,
  AaveLikeReserveData,
} from 'lendingProtocols/aave-like-common'
import React from 'react'

import { PositionInfoComponent } from './PositionInfoComponent'

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
  const position = state.context.currentPosition

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
