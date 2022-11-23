import { useActor } from '@xstate/react'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { useManageAaveStateMachineContext } from 'features/aave/manage/containers/AaveManageStateMachineContext'
import { useOpenAaveStateMachineContext } from 'features/aave/open/containers/AaveOpenStateMachineContext'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservable } from 'helpers/observableHook'
import React from 'react'

import { AaveMultiplyPositionData } from './AaveMultiplyPositionData'

export function AaveMultiplyManageComponent({ isManage = false }: { isManage?: boolean }) {
  const { stateMachine } = isManage
    ? useManageAaveStateMachineContext()
    : useOpenAaveStateMachineContext()
  const [state] = useActor(stateMachine)
  const { aaveReserveData } = useAaveContext()
  const [aaveUSDCReserveData] = useObservable(aaveReserveData['USDC'])
  const [aaveSTETHReserveData] = useObservable(aaveReserveData['STETH'])

  return (
    <WithLoadingIndicator
      value={[
        state.context.currentPosition,
        state.context.collateralPrice,
        state.context.tokenPrice,
        aaveUSDCReserveData,
        aaveSTETHReserveData,
      ]}
      customLoader={<AppSpinner />}
    >
      {([
        currentPosition,
        collateralTokenPrice,
        debtTokenPrice,
        USDCReserveData,
        STETHReserveData,
      ]) => {
        return (
          <AaveMultiplyPositionData
            currentPosition={currentPosition}
            collateralTokenPrice={collateralTokenPrice}
            collateralTokenReserveData={STETHReserveData}
            debtTokenPrice={debtTokenPrice}
            debtTokenReserveData={USDCReserveData}
          />
        )
      }}
    </WithLoadingIndicator>
  )
}
