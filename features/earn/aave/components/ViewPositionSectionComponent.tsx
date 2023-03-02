import { AaveV2ReserveConfigurationData } from 'blockchain/aave/aaveV2ProtocolDataProvider'
import { useSimulationYields } from 'features/aave/common/hooks/useSimulationYields'
import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { AaveProtocolData, PreparedAaveReserveData } from 'lendingProtocols/aave-v2/pipelines'
import React from 'react'

import { PositionInfoComponent } from './PositionInfoComponent'

export type ViewPositionSectionComponentProps = {
  aaveReserveState: AaveV2ReserveConfigurationData
  aaveReserveDataDebtToken: PreparedAaveReserveData
  aaveProtocolData?: AaveProtocolData
  strategyConfig: IStrategyConfig
}

export function ViewPositionSectionComponent({
  aaveReserveDataDebtToken,
  aaveProtocolData,
  strategyConfig,
}: ViewPositionSectionComponentProps) {
  const { position } = aaveProtocolData!

  const simulations = useSimulationYields({
    amount: position?.collateral.amount,
    riskRatio: position?.riskRatio,
    fields: ['7Days'],
    strategy: strategyConfig,
    token: strategyConfig.tokens.deposit,
  })

  return (
    <PositionInfoComponent
      aaveReserveDataDebtToken={aaveReserveDataDebtToken}
      apy={simulations?.apy}
      position={position}
    />
  )
}
