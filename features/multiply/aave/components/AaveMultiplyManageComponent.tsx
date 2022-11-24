import { useActor } from '@xstate/react'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { useManageAaveStateMachineContext } from 'features/aave/manage/containers/AaveManageStateMachineContext'
import { useOpenAaveStateMachineContext } from 'features/aave/open/containers/AaveOpenStateMachineContext'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React from 'react'

import { AaveMultiplyPositionData } from './AaveMultiplyPositionData'

export function AaveMultiplyManageComponent({ isManage = false }: { isManage?: boolean }) {
  const { stateMachine } = isManage
    ? useManageAaveStateMachineContext()
    : useOpenAaveStateMachineContext()
  const [state] = useActor(stateMachine)
  const { aaveReserveData } = useAaveContext()
  const [debtTokenReserveData, debtTokenReserveDataError] = useObservable(
    aaveReserveData[state.context.strategyConfig.tokens.debt],
  )
  const [collateralTokenReserveData, collateralTokenReserveDataError] = useObservable(
    aaveReserveData[state.context.strategyConfig.tokens.collateral],
  )

  return (
    <WithErrorHandler error={[debtTokenReserveDataError, collateralTokenReserveDataError]}>
      <WithLoadingIndicator
        value={[
          state.context.currentPosition,
          state.context.collateralPrice,
          state.context.tokenPrice,
          debtTokenReserveData,
          collateralTokenReserveData,
        ]}
        customLoader={<AppSpinner />}
      >
        {([
          currentPosition,
          collateralTokenPrice,
          debtTokenPrice,
          _debtTokenReserveData,
          _collateralTokenReserveData,
        ]) => {
          return (
            <AaveMultiplyPositionData
              currentPosition={currentPosition}
              collateralTokenPrice={collateralTokenPrice}
              collateralTokenReserveData={_collateralTokenReserveData}
              debtTokenPrice={debtTokenPrice}
              debtTokenReserveData={_debtTokenReserveData}
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
