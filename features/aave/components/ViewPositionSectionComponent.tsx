import type { IPosition } from '@oasisdex/dma-library'
import type { AaveV2ReserveConfigurationData } from 'blockchain/aave/aaveV2ProtocolDataProvider'
import { useSimulationYields } from 'features/aave/hooks'
import type { IStrategyConfig } from 'features/aave/types/strategy-config'
import type { AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import React from 'react'

import { PositionInfoComponent } from './PositionInfoComponent'

export type ViewPositionSectionComponentProps = {
  aaveReserveState: AaveV2ReserveConfigurationData
  aaveReserveDataDebtToken: AaveLikeReserveData
  currentPosition: IPosition
  strategyConfig: IStrategyConfig
}

export function ViewPositionSectionComponent({
  aaveReserveDataDebtToken,
  currentPosition,
  strategyConfig,
}: ViewPositionSectionComponentProps) {
  const simulations = useSimulationYields({
    amount: currentPosition?.collateral.amount,
    riskRatio: currentPosition?.riskRatio,
    fields: ['7Days'],
    strategy: strategyConfig,
    token: strategyConfig.tokens.deposit,
  })

  return (
    <PositionInfoComponent
      aaveReserveDataDebtToken={aaveReserveDataDebtToken}
      apy={simulations?.apy}
      position={currentPosition}
    />
  )
}
