import { IPosition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React from 'react'

import { AaveMultiplyPositionData } from './AaveMultiplyPositionData'

export type AaveMultiplyManageComponentProps = {
  currentPosition?: IPosition
  nextPosition?: IPosition
  strategyConfig: IStrategyConfig
  collateralPrice?: BigNumber
  tokenPrice?: BigNumber
  debtPrice?: BigNumber
}

export function AaveMultiplyManageComponent({
  currentPosition,
  collateralPrice,
  debtPrice,
  strategyConfig,
  nextPosition,
}: AaveMultiplyManageComponentProps) {
  const { wrappedGetAaveReserveData$, aaveReserveConfigurationData$ } = useAaveContext()
  const [debtTokenReserveData, debtTokenReserveDataError] = useObservable(
    wrappedGetAaveReserveData$(strategyConfig.tokens.debt),
  )
  const [collateralTokenReserveData, collateralTokenReserveDataError] = useObservable(
    wrappedGetAaveReserveData$(strategyConfig.tokens.collateral),
  )
  const [debtTokenReserveConfigurationData, debtTokenReserveConfigurationDataError] = useObservable(
    aaveReserveConfigurationData$({ token: strategyConfig.tokens.debt }),
  )

  return (
    <WithErrorHandler
      error={[
        debtTokenReserveDataError,
        collateralTokenReserveDataError,
        debtTokenReserveConfigurationDataError,
      ]}
    >
      <WithLoadingIndicator
        value={[
          currentPosition,
          collateralPrice,
          debtPrice,
          debtTokenReserveData,
          collateralTokenReserveData,
          debtTokenReserveConfigurationData,
        ]}
        customLoader={<AppSpinner />}
      >
        {([
          _currentPosition,
          _collateralTokenPrice,
          _debtTokenPrice,
          _debtTokenReserveData,
          _collateralTokenReserveData,
          _debtTokenReserveConfigurationData,
        ]) => {
          return (
            <AaveMultiplyPositionData
              currentPosition={_currentPosition}
              collateralTokenPrice={_collateralTokenPrice}
              collateralTokenReserveData={_collateralTokenReserveData}
              debtTokenPrice={_debtTokenPrice}
              debtTokenReserveData={_debtTokenReserveData}
              debtTokenReserveConfigurationData={_debtTokenReserveConfigurationData}
              nextPosition={nextPosition}
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
