import React from 'react'
import { AaveV2ReserveConfigurationData } from 'blockchain/aave/aaveV2ProtocolDataProvider'
import { PositionInfoComponent } from 'features/aave/components/PositionInfoComponent'
import { useSimulationYields } from 'features/aave/hooks'
import { IStrategyConfig } from 'features/aave/types/strategy-config'
import { AaveLikeProtocolData, AaveLikeReserveData } from 'lendingProtocols/aave-like-common'

export type ViewPositionSectionComponentProps = {
  aaveReserveState: AaveV2ReserveConfigurationData
  aaveReserveDataDebtToken: AaveLikeReserveData
  aaveProtocolData?: AaveLikeProtocolData
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
