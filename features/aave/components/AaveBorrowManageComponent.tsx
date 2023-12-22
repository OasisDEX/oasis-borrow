import { useAaveContext } from 'features/aave'
import { supportsAaveStopLoss } from 'features/aave/helpers/supportsAaveStopLoss'
import { isSupportedAaveAutomationTokenPair } from 'features/automation/common/helpers/isSupportedAaveAutomationTokenPair'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React from 'react'

import { AaveBorrowPositionData } from './AaveBorrowPositionData'
import type { AaveManageComponentProps } from './AaveMultiplyManageComponent'

export function AaveBorrowManageComponent({
  currentPosition,
  collateralPrice,
  debtPrice,
  strategyConfig,
  nextPosition,
  dpmProxy,
  isOpenView,
  cumulatives,
}: AaveManageComponentProps) {
  const { getAaveLikeReserveData$, aaveLikeReserveConfigurationData$, aaveHistory$ } =
    useAaveContext(strategyConfig.protocol, strategyConfig.network)
  const _aaveHistory$ = aaveHistory$(dpmProxy!)
  const [aaveHistory, aaveHistoryError] = useObservable(_aaveHistory$)
  const [debtTokenReserveData, debtTokenReserveDataError] = useObservable(
    getAaveLikeReserveData$({ token: strategyConfig.tokens.debt }),
  )
  const [collateralTokenReserveData, collateralTokenReserveDataError] = useObservable(
    getAaveLikeReserveData$({ token: strategyConfig.tokens.collateral }),
  )
  const [debtTokenReserveConfigurationData, debtTokenReserveConfigurationDataError] = useObservable(
    aaveLikeReserveConfigurationData$({
      collateralToken: strategyConfig.tokens.debt,
      debtToken: strategyConfig.tokens.collateral,
    }),
  )
  const isAutomationAvailable =
    !isOpenView &&
    isSupportedAaveAutomationTokenPair(
      strategyConfig.tokens.collateral,
      strategyConfig.tokens.debt,
    ) &&
    supportsAaveStopLoss(strategyConfig.protocol, strategyConfig.networkId)
  return (
    <WithErrorHandler
      error={[
        debtTokenReserveDataError,
        collateralTokenReserveDataError,
        debtTokenReserveConfigurationDataError,
        aaveHistoryError,
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
          aaveHistory,
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
          _aaveHistory,
        ]) => {
          return (
            <AaveBorrowPositionData
              strategyType={strategyConfig.strategyType}
              currentPosition={_currentPosition}
              collateralTokenPrice={_collateralTokenPrice}
              collateralTokenReserveData={_collateralTokenReserveData}
              debtTokenPrice={_debtTokenPrice}
              debtTokenReserveData={_debtTokenReserveData}
              debtTokenReserveConfigurationData={_debtTokenReserveConfigurationData}
              nextPosition={nextPosition}
              aaveHistory={_aaveHistory}
              cumulatives={cumulatives}
              isAutomationAvailable={isAutomationAvailable}
              lendingProtocol={strategyConfig.protocol}
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
