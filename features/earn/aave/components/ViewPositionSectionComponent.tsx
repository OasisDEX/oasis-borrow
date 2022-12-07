import { AaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { useSimulationYields } from 'helpers/useSimulationYields'
import React from 'react'

import { PreparedAaveReserveData } from '../../../aave/helpers/aavePrepareReserveData'
import { AaveProtocolData } from '../../../aave/manage/services'
import { PositionInfoComponent } from './PositionInfoComponent'

export type ViewPositionSectionComponentProps = {
  aaveReserveState: AaveReserveConfigurationData
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
    amount: accountData?.totalCollateralETH,
    riskRatio: position?.riskRatio,
    fields: ['7Days'],
  })

  return (
    <PositionInfoComponent
      aaveReserveDataDebtToken={aaveReserveDataDebtToken}
      accountData={accountData}
      apy={simulations?.apy}
      tokens={strategyConfig.tokens}
      oraclePrice={oraclePrice}
      position={position}
    />
  )
}
