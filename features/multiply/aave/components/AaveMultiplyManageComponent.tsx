import { IPosition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { StrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React from 'react'

import { AaveMultiplyPositionData } from './AaveMultiplyPositionData'

export type AaveMultiplyManageComponentProps = {
  currentPosition?: IPosition
  nextPosition?: IPosition
  strategyConfig: StrategyConfig
  collateralPrice?: BigNumber
  tokenPrice?: BigNumber
}

export function AaveMultiplyManageComponent({
  currentPosition,
  collateralPrice,
  tokenPrice,
  strategyConfig,
  nextPosition,
}: AaveMultiplyManageComponentProps) {
  const { wrappedGetAaveReserveData$ } = useAaveContext()
  const [debtTokenReserveData, debtTokenReserveDataError] = useObservable(
    wrappedGetAaveReserveData$(strategyConfig.tokens.debt),
  )
  const [collateralTokenReserveData, collateralTokenReserveDataError] = useObservable(
    wrappedGetAaveReserveData$(strategyConfig.tokens.collateral),
  )

  return (
    <WithErrorHandler error={[debtTokenReserveDataError, collateralTokenReserveDataError]}>
      <WithLoadingIndicator
        value={[
          currentPosition,
          collateralPrice,
          tokenPrice,
          debtTokenReserveData,
          collateralTokenReserveData,
        ]}
        customLoader={<AppSpinner />}
      >
        {([
          _currentPosition,
          _collateralTokenPrice,
          _debtTokenPrice,
          _debtTokenReserveData,
          _collateralTokenReserveData,
        ]) => {
          return (
            <AaveMultiplyPositionData
              currentPosition={_currentPosition}
              collateralTokenPrice={_collateralTokenPrice}
              collateralTokenReserveData={_collateralTokenReserveData}
              debtTokenPrice={_debtTokenPrice}
              debtTokenReserveData={_debtTokenReserveData}
              nextPosition={nextPosition}
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
