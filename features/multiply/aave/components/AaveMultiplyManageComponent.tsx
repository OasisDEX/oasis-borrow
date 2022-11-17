import { useActor } from '@xstate/react'
import { useManageAaveStateMachineContext } from 'features/aave/manage/containers/AaveManageStateMachineContext'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import React from 'react'

import { AaveMultiplyPositionData } from './AaveMultiplyPositionData'

export function AaveMultiplyManageComponent() {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)

  return (
    <WithLoadingIndicator
      value={[state.context.currentPosition, state.context.collateralPrice]}
      customLoader={<AppSpinner />}
    >
      {([currentPosition, oraclePrice]) => {
        return (
          <AaveMultiplyPositionData currentPosition={currentPosition} oraclePrice={oraclePrice} />
        )
      }}
    </WithLoadingIndicator>
  )
}
