import { AaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { StrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { PreparedAaveReserveData } from 'features/aave/helpers/aavePrepareReserveData'
import { AaveProtocolData } from 'features/aave/manage/state'
import { getAutomationAavePositionData } from 'features/automation/common/context/getAutomationAavePositionData'
import { AutomationContextInput } from 'features/automation/contexts/AutomationContextInput'
import { VaultProtocol } from 'helpers/getVaultProtocol'
import React, { PropsWithChildren, useMemo } from 'react'

export interface AaveManageVaultState {
  address: string
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataETH: PreparedAaveReserveData
  strategyConfig: StrategyConfig
  aaveProtocolData: AaveProtocolData
}

interface AaveAutomationContextProps {
  aaveManageVault: AaveManageVaultState
}

export function AaveAutomationContext({
  children,
  aaveManageVault,
}: PropsWithChildren<AaveAutomationContextProps>) {
  const positionData = useMemo(() => getAutomationAavePositionData({ aaveManageVault }), [
    aaveManageVault,
  ])

  const commonData = useMemo(
    () => ({
      controller: aaveManageVault.address,
      nextCollateralPrice: aaveManageVault.aaveProtocolData.oraclePrice,
      token: aaveManageVault.strategyConfig.tokens?.collateral!,
    }),
    [aaveManageVault],
  )

  return (
    <AutomationContextInput
      positionData={positionData}
      commonData={commonData}
      protocol={VaultProtocol.Aave}
    >
      {children}
    </AutomationContextInput>
  )
}
