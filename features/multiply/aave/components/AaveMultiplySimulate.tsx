import { useActor } from '@xstate/react'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { useOpenAaveStateMachineContext } from 'features/aave/open/containers/AaveOpenStateMachineContext'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservable } from 'helpers/observableHook'
import React from 'react'

import { AaveMultiplyPositionData } from './AaveMultiplyPositionData'

export function AaveMultiplySimulate() {
  const { stateMachine } = useOpenAaveStateMachineContext()
  const [state] = useActor(stateMachine)
  const { aaveReserveData } = useAaveContext()
  const [aaveUSDCReserveData] = useObservable(aaveReserveData['USDC'])
  const [aaveSTETHReserveData] = useObservable(aaveReserveData['STETH'])

  return (
    <WithLoadingIndicator
      value={[
        state.context.currentPosition,
        state.context.userInput,
        state.context.collateralPrice,
        state.context.tokenPrice,
        aaveUSDCReserveData,
        aaveSTETHReserveData,
      ]}
      customLoader={<AppSpinner />}
    >
      {([
        currentPosition,
        userInput,
        collateralTokenPrice,
        debtTokenPrice,
        USDCReserveData,
        STETHReserveData,
      ]) => {
        return (
          <AaveMultiplyPositionData
            currentPosition={currentPosition}
            userInput={userInput}
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
