import type { IPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { PositionLoadingOverviewState } from 'components/vault/PositionLoadingState'
import { useAaveContext } from 'features/aave'
import { supportsAaveStopLoss } from 'features/aave/helpers/supportsAaveStopLoss'
import type { TriggersAaveEvent, triggersAaveStateMachine } from 'features/aave/manage/state'
import type { IStrategyConfig } from 'features/aave/types'
import { isSupportedAaveAutomationTokenPair } from 'features/automation/common/helpers/isSupportedAaveAutomationTokenPair'
import type { AaveCumulativeData } from 'features/omni-kit/protocols/aave/history/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React from 'react'
import type { Sender, StateFrom } from 'xstate'

import { AaveMultiplyPositionData } from './AaveMultiplyPositionData'

export type AaveManageComponentProps = {
  isOpenView?: boolean
  currentPosition?: IPosition
  nextPosition?: IPosition
  strategyConfig: IStrategyConfig
  collateralPrice?: BigNumber
  tokenPrice?: BigNumber
  debtPrice?: BigNumber
  dpmProxy?: string
  cumulatives?: AaveCumulativeData
  triggersState?: StateFrom<typeof triggersAaveStateMachine>
  sendTriggerEvent?: Sender<TriggersAaveEvent>
}

export function AaveMultiplyManageComponent({
  currentPosition,
  collateralPrice,
  debtPrice,
  strategyConfig,
  nextPosition,
  dpmProxy,
  isOpenView,
  cumulatives,
  triggersState,
  sendTriggerEvent,
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
        customLoader={<PositionLoadingOverviewState />}
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
            <AaveMultiplyPositionData
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
              productType={strategyConfig.type}
              triggersState={triggersState}
              sendTriggerEvent={sendTriggerEvent}
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
