import { AaveV2ReserveConfigurationData } from 'blockchain/aave/aaveV2ProtocolDataProvider'
import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { useSimulationYields } from 'helpers/useSimulationYields'
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
  const { accountData, oraclePrice, position } = aaveProtocolData!

  const simulations = useSimulationYields({
    riskRatio: position?.riskRatio,
    fields: ['7Days'],
    strategy: strategyConfig,
  })

  return (
    <PositionInfoComponent
      aaveReserveDataDebtToken={aaveReserveDataDebtToken}
      apy={simulations?.apy}
      oraclePrice={oraclePrice}
      position={position}
    />
  )
}
