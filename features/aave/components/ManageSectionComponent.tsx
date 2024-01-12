import type { IPosition } from '@oasisdex/dma-library'
import { useActor } from '@xstate/react'
import type BigNumber from 'bignumber.js'
import { useAaveContext } from 'features/aave/aave-context-provider'
import { useSimulationYields } from 'features/aave/hooks'
import { useManageAaveStateMachineContext } from 'features/aave/manage/contexts'
import type { IStrategyConfig } from 'features/aave/types'
import type { AaveCumulativeData } from 'features/omni-kit/protocols/aave/history/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
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
  collateralPrice?: BigNumber
  debtPrice?: BigNumber
  collateralTokenReserveData?: AaveLikeReserveData
  debtTokenReserveData?: AaveLikeReserveData
  cumulatives?: AaveCumulativeData
  currentPosition: IPosition
}

export function ManageSectionComponent({
  aaveReserveState,
  aaveReserveDataDebtToken,
  strategyConfig,
  collateralPrice,
  debtPrice,
  cumulatives,
  currentPosition,
}: ManageSectionComponentProps) {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)

  const simulations = useSimulationYields({
    amount: currentPosition?.collateral.amount,
    riskRatio: currentPosition?.riskRatio,
    fields: ['7Days'],
    strategy: strategyConfig,
    token: state.context.tokens.deposit,
  })
  const { getAaveLikeReserveData$ } = useAaveContext(
    strategyConfig.protocol,
    strategyConfig.network,
  )
  const [collateralTokenReserveData, collateralTokenReserveDataError] = useObservable(
    getAaveLikeReserveData$({ token: strategyConfig.tokens.collateral }),
  )
  const [debtTokenReserveData, debtTokenReserveDataError] = useObservable(
    getAaveLikeReserveData$({ token: strategyConfig.tokens.debt }),
  )
  return (
    <WithErrorHandler error={[debtTokenReserveDataError, collateralTokenReserveDataError]}>
      <WithLoadingIndicator
        value={[
          currentPosition,
          aaveReserveState?.liquidationThreshold,
          collateralPrice,
          debtPrice,
          collateralTokenReserveData,
          debtTokenReserveData,
        ]}
      >
        {([
          _position,
          _liquidationThreshold,
          _collateralTokenPrice,
          _debtTokenPrice,
          _collateralTokenReserveData,
          _debtTokenReserveData,
        ]) => (
          <PositionInfoComponent
            aaveReserveDataDebtToken={aaveReserveDataDebtToken}
            apy={simulations?.apy}
            position={_position}
            cumulatives={cumulatives}
            collateralTokenPrice={_collateralTokenPrice}
            debtTokenPrice={_debtTokenPrice}
            collateralTokenReserveData={_collateralTokenReserveData}
            debtTokenReserveData={_debtTokenReserveData}
            productType={strategyConfig.type}
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
